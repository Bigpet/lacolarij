/**
 * Conflict resolution service.
 *
 * Handles resolving conflicts between local and remote versions of issues.
 */

import { api } from "@/lib/api";
import { issueRepository, pendingOperationsRepository } from "@/lib/db";
import { useSyncStore, type Conflict } from "@/stores/syncStore";
import type { Issue } from "@/types";

export type ConflictResolution =
  | { type: "keep_local" }
  | { type: "keep_remote" }
  | { type: "merge"; merged: Partial<Issue> };

/**
 * Resolve a conflict between local and remote versions.
 */
export async function resolveConflict(
  conflict: Conflict,
  resolution: ConflictResolution,
  connectionId: string
): Promise<void> {
  const store = useSyncStore.getState();

  if (conflict.entityType !== "issue") {
    throw new Error("Only issue conflicts are supported");
  }

  const localIssue = conflict.localValue as Issue;
  const remoteIssue = conflict.remoteValue as Issue;

  switch (resolution.type) {
    case "keep_local": {
      // Force push local version to JIRA
      await api.updateIssue(connectionId, localIssue.key, {
        fields: {
          summary: localIssue.summary,
          description: localIssue.description,
        },
      });

      // Get updated remote version
      const updated = await api.getIssue(connectionId, localIssue.key);

      // Update local with new remote version
      await issueRepository.put({
        ...localIssue,
        _syncStatus: "synced",
        _remoteVersion: updated.fields.updated,
        _syncError: null,
      });

      break;
    }

    case "keep_remote": {
      // Discard local changes, use remote version
      await issueRepository.put({
        ...remoteIssue,
        _syncStatus: "synced",
        _syncError: null,
      });

      break;
    }

    case "merge": {
      // Apply merged values
      const mergedIssue: Issue = {
        ...localIssue,
        ...resolution.merged,
      };

      // Push merged version to JIRA
      await api.updateIssue(connectionId, mergedIssue.key, {
        fields: {
          summary: mergedIssue.summary,
          description: mergedIssue.description,
        },
      });

      // Get updated remote version
      const updated = await api.getIssue(connectionId, mergedIssue.key);

      // Update local with merged values and new version
      await issueRepository.put({
        ...mergedIssue,
        _syncStatus: "synced",
        _remoteVersion: updated.fields.updated,
        _syncError: null,
      });

      break;
    }
  }

  // Remove pending operations for this issue
  await pendingOperationsRepository.deleteByEntityId(conflict.entityId);

  // Remove conflict from store
  store.removeConflict(conflict.id);

  // Update pending count
  const pendingCount = await pendingOperationsRepository.count();
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
  const diffs: { field: string; localValue: unknown; remoteValue: unknown }[] = [];

  // Compare key fields
  const fieldsToCompare: (keyof Issue)[] = [
    "summary",
    "status",
    "priority",
    "assignee",
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
  if (JSON.stringify(local.description) !== JSON.stringify(remote.description)) {
    diffs.push({
      field: "description",
      localValue: local.description,
      remoteValue: remote.description,
    });
  }

  return diffs;
}
