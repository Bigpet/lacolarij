/**
 * Issue service for local-first mutations.
 *
 * All mutations:
 * 1. Update the local issue in IndexedDB immediately (optimistic)
 * 2. Queue a pending operation for sync
 * 3. Update the sync store's pending count
 */

import { issueRepository, pendingOperationsRepository } from '@/lib/db';
import { useSyncStore } from '@/stores/syncStore';
import type { Issue } from '@/types';

async function updatePendingCount(): Promise<void> {
  const count = await pendingOperationsRepository.count();
  useSyncStore.getState().setPendingCount(count);
}

export const issueService = {
  /**
   * Update the summary of an issue locally.
   */
  async updateSummary(issueId: string, summary: string): Promise<void> {
    const issue = await issueRepository.getById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    const now = Date.now();

    // 1. Update local issue
    await issueRepository.put({
      ...issue,
      summary,
      _localUpdated: now,
      _syncStatus: 'pending',
    });

    // 2. Queue pending operation
    await pendingOperationsRepository.add({
      entityType: 'issue',
      entityId: issueId,
      operation: 'update',
      payload: { fields: { summary } },
      createdAt: now,
      attempts: 0,
      lastError: null,
    });

    // 3. Update pending count in store
    await updatePendingCount();
  },

  /**
   * Update the description of an issue locally.
   */
  async updateDescription(
    issueId: string,
    description: unknown
  ): Promise<void> {
    const issue = await issueRepository.getById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    const now = Date.now();

    // 1. Update local issue
    await issueRepository.put({
      ...issue,
      description,
      _localUpdated: now,
      _syncStatus: 'pending',
    });

    // 2. Queue pending operation
    await pendingOperationsRepository.add({
      entityType: 'issue',
      entityId: issueId,
      operation: 'update',
      payload: { fields: { description } },
      createdAt: now,
      attempts: 0,
      lastError: null,
    });

    // 3. Update pending count in store
    await updatePendingCount();
  },

  /**
   * Transition an issue to a new status locally.
   */
  async transitionIssue(
    issueId: string,
    transitionId: string,
    targetStatus: {
      name: string;
      category: 'todo' | 'indeterminate' | 'done';
    }
  ): Promise<void> {
    const issue = await issueRepository.getById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    const now = Date.now();

    // 1. Update local issue
    await issueRepository.put({
      ...issue,
      status: targetStatus.name,
      statusCategory: targetStatus.category,
      _localUpdated: now,
      _syncStatus: 'pending',
    });

    // 2. Queue pending operation (transition is a special type)
    await pendingOperationsRepository.add({
      entityType: 'issue',
      entityId: issueId,
      operation: 'update',
      payload: { transition: { id: transitionId } },
      createdAt: now,
      attempts: 0,
      lastError: null,
    });

    // 3. Update pending count in store
    await updatePendingCount();
  },

  /**
   * Mark an issue as synced (after successful push).
   */
  async markSynced(issueId: string, newRemoteVersion: string): Promise<void> {
    const issue = await issueRepository.getById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    await issueRepository.put({
      ...issue,
      _syncStatus: 'synced',
      _remoteVersion: newRemoteVersion,
      _syncError: null,
    });
  },

  /**
   * Mark an issue as having a conflict.
   */
  async markConflict(
    issueId: string,
    remoteIssue: Issue,
    connectionId?: string,
    _pendingOperationId?: string
  ): Promise<void> {
    const localIssue = await issueRepository.getById(issueId);
    if (!localIssue) {
      throw new Error('Issue not found');
    }

    // Use provided connectionId or fall back to active connection
    const effectiveConnectionId =
      connectionId || useSyncStore.getState().activeConnectionId || '';

    // Update local issue to conflict status
    await issueRepository.put({
      ...localIssue,
      _syncStatus: 'conflict',
    });

    // Add conflict to store
    useSyncStore.getState().addConflict({
      id: `${issueId}-${Date.now()}`,
      entityType: 'issue',
      entityId: issueId,
      entityKey: localIssue.key,
      localValue: localIssue,
      remoteValue: remoteIssue,
      localTimestamp: localIssue._localUpdated,
      remoteTimestamp: remoteIssue._remoteVersion,
      connectionId: effectiveConnectionId,
    });
  },

  /**
   * Discard local changes and use remote version.
   */
  async discardLocalChanges(
    issueId: string,
    remoteIssue: Issue
  ): Promise<void> {
    // Replace local with remote
    await issueRepository.put({
      ...remoteIssue,
      _syncStatus: 'synced',
    });

    // Remove any pending operations for this issue
    await pendingOperationsRepository.deleteByEntityId(issueId);

    // Update pending count
    await updatePendingCount();
  },
};
