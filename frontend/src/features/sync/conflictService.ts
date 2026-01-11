/**
 * Conflict resolution service.
 *
 * Handles resolving conflicts between local and remote versions of issues.
 */

import { api } from '@/lib/api';
import { issueRepository, pendingOperationsRepository } from '@/lib/db';
import { useSyncStore, type Conflict } from '@/stores/syncStore';
import type { Issue } from '@/types';

export type ConflictResolution =
  | { type: 'keep_local' }
  | { type: 'keep_remote' }
  | { type: 'merge'; merged: Partial<Issue> };

/**
 * Resolve a conflict between local and remote versions.
 */
export async function resolveConflict(
  conflict: Conflict,
  resolution: ConflictResolution
): Promise<void> {
  console.log('[conflictService] resolveConflict called with:', {
    conflictId: conflict.id,
    resolutionType: resolution.type,
    connectionId: conflict.connectionId,
  });

  const store = useSyncStore.getState();

  if (conflict.entityType !== 'issue') {
    throw new Error('Only issue conflicts are supported');
  }

  const localIssue = conflict.localValue as Issue;
  const remoteIssue = conflict.remoteValue as Issue;

  console.log('[conflictService] localIssue.key:', localIssue.key);
  console.log('[conflictService] connectionId:', conflict.connectionId);

  switch (resolution.type) {
    case 'keep_local': {
      // Force push local version to JIRA
      console.log('[conflictService] Calling api.updateIssue...');
      try {
        await api.updateIssue(conflict.connectionId, localIssue.key, {
          fields: {
            summary: localIssue.summary,
            description: localIssue.description,
          },
        });
        console.log('[conflictService] api.updateIssue succeeded');
      } catch (err) {
        console.error('[conflictService] api.updateIssue FAILED:', err);
        throw err;
      }

      // Get updated remote version
      console.log('[conflictService] Getting updated remote version...');
      const updated = await api.getIssue(conflict.connectionId, localIssue.key);
      console.log(
        '[conflictService] Got updated remote:',
        updated.fields.updated
      );

      // Update local with new remote version
      console.log('[conflictService] Updating local issue in IndexedDB...');
      await issueRepository.put({
        ...localIssue,
        _syncStatus: 'synced',
        _remoteVersion: updated.fields.updated,
        _syncError: null,
      });
      console.log('[conflictService] Local issue updated');

      break;
    }

    case 'keep_remote': {
      // Discard local changes, use remote version
      await issueRepository.put({
        ...remoteIssue,
        _syncStatus: 'synced',
        _syncError: null,
      });

      break;
    }

    case 'merge': {
      // Apply merged values
      const mergedIssue: Issue = {
        ...localIssue,
        ...resolution.merged,
      };

      // Push merged version to JIRA
      await api.updateIssue(conflict.connectionId, mergedIssue.key, {
        fields: {
          summary: mergedIssue.summary,
          description: mergedIssue.description,
        },
      });

      // Get updated remote version
      const updated = await api.getIssue(
        conflict.connectionId,
        mergedIssue.key
      );

      // Update local with merged values and new version
      await issueRepository.put({
        ...mergedIssue,
        _syncStatus: 'synced',
        _remoteVersion: updated.fields.updated,
        _syncError: null,
      });

      break;
    }
  }

  // Remove pending operations for this issue
  console.log(
    '[conflictService] Deleting pending operations for entity:',
    conflict.entityId
  );
  await pendingOperationsRepository.deleteByEntityId(conflict.entityId);

  // Remove conflict from store
  console.log('[conflictService] Removing conflict from store:', conflict.id);
  console.log(
    '[conflictService] Store conflicts before removal:',
    store.conflicts.map((c) => c.id)
  );
  store.removeConflict(conflict.id);
  console.log(
    '[conflictService] Store conflicts after removal:',
    useSyncStore.getState().conflicts.map((c) => c.id)
  );

  // Update pending count
  const pendingCount = await pendingOperationsRepository.count();
  console.log('[conflictService] Setting pending count:', pendingCount);
  store.setPendingCount(pendingCount);
}

/**
 * Get diff between local and remote issues.
 * Returns fields that differ.
 */
export function getIssueDiff(
  local: Issue,
  remote: Issue
): { field: string; localValue: unknown; remoteValue: unknown }[] {
  const diffs: { field: string; localValue: unknown; remoteValue: unknown }[] =
    [];

  // Compare key fields
  const fieldsToCompare: (keyof Issue)[] = [
    'summary',
    'status',
    'priority',
    'assignee',
  ];

  for (const field of fieldsToCompare) {
    if (local[field] !== remote[field]) {
      diffs.push({
        field,
        localValue: local[field],
        remoteValue: remote[field],
      });
    }
  }

  // Compare description (by stringification since it's ADF)
  if (
    JSON.stringify(local.description) !== JSON.stringify(remote.description)
  ) {
    diffs.push({
      field: 'description',
      localValue: local.description,
      remoteValue: remote.description,
    });
  }

  return diffs;
}
