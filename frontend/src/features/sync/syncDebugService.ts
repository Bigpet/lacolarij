/**
 * Sync debug service for logging and isolated sync operations.
 */

import { useSyncDebugStore } from '@/stores/syncDebugStore';
import { useSyncStore } from '@/stores/syncStore';
import {
  pendingOperationsRepository,
  issueRepository,
  commentRepository,
} from '@/lib/db';
import { api, type JiraIssue } from '@/lib/api';
import type { Issue, PendingOperation, SyncLogEntry } from '@/types';

/**
 * Log a sync event to the debug store.
 */
export function logSyncEvent(
  entry: Omit<SyncLogEntry, 'id' | 'timestamp'>
): void {
  useSyncDebugStore.getState().addLog(entry);
}

// Helper to map status category
function mapStatusCategory(
  category: string
): 'todo' | 'indeterminate' | 'done' {
  switch (category.toLowerCase()) {
    case 'new':
    case 'undefined':
      return 'todo';
    case 'done':
      return 'done';
    default:
      return 'indeterminate';
  }
}

// Convert JIRA issue to local issue format
function mapJiraIssueToLocal(jiraIssue: JiraIssue): Issue {
  const { fields } = jiraIssue;

  return {
    id: jiraIssue.id,
    key: jiraIssue.key,
    projectKey: fields.project.key,
    summary: fields.summary,
    description: fields.description,
    status: fields.status.name,
    statusCategory: mapStatusCategory(fields.status.statusCategory.key),
    assignee: fields.assignee?.displayName || null,
    reporter: fields.reporter?.displayName || '',
    priority: fields.priority?.name || 'Medium',
    issueType: fields.issuetype.name,
    labels: fields.labels || [],
    created: fields.created,
    updated: fields.updated,
    _localUpdated: Date.now(),
    _syncStatus: 'synced',
    _syncError: null,
    _remoteVersion: fields.updated,
  };
}

export interface SyncSingleOperationResult {
  success: boolean;
  error?: string;
}

/**
 * Execute a single pending operation in isolation.
 * Does NOT delete the operation on failure - only on success.
 */
export async function syncSingleOperation(
  connectionId: string,
  operationId: string
): Promise<SyncSingleOperationResult> {
  logSyncEvent({
    level: 'info',
    operation: 'isolated-sync',
    message: `Starting isolated sync for operation ${operationId}`,
    details: { connectionId, operationId },
  });

  const op = await pendingOperationsRepository.getById(operationId);
  if (!op) {
    const error = `Operation ${operationId} not found`;
    logSyncEvent({
      level: 'error',
      operation: 'isolated-sync',
      message: error,
    });
    return { success: false, error };
  }

  logSyncEvent({
    level: 'info',
    operation: 'isolated-sync',
    entityType: op.entityType,
    entityId: op.entityId,
    message: `Found operation: ${op.operation} ${op.entityType}`,
    details: op,
  });

  try {
    if (op.entityType === 'comment') {
      await executeCommentOperation(connectionId, op);
    } else if (op.operation === 'create') {
      await executeCreateOperation(connectionId, op);
    } else {
      await executeIssueOperation(connectionId, op);
    }

    // Success - delete the operation
    await pendingOperationsRepository.delete(operationId);

    // Update pending count
    const count = await pendingOperationsRepository.count();
    useSyncStore.getState().setPendingCount(count);

    logSyncEvent({
      level: 'success',
      operation: 'isolated-sync',
      entityType: op.entityType,
      entityId: op.entityId,
      message: `Successfully synced operation ${operationId}`,
    });

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Update attempt count but do NOT delete
    await pendingOperationsRepository.updateAttempt(operationId, errorMessage);

    logSyncEvent({
      level: 'error',
      operation: 'isolated-sync',
      entityType: op.entityType,
      entityId: op.entityId,
      message: `Failed to sync operation: ${errorMessage}`,
      details: { error: errorMessage },
    });

    return { success: false, error: errorMessage };
  }
}

async function executeIssueOperation(
  connectionId: string,
  op: PendingOperation
): Promise<void> {
  const localIssue = await issueRepository.getById(op.entityId);
  if (!localIssue) {
    throw new Error('Issue not found locally');
  }

  logSyncEvent({
    level: 'info',
    operation: 'isolated-sync',
    entityType: 'issue',
    entityId: op.entityId,
    entityKey: localIssue.key,
    message: `Fetching remote issue ${localIssue.key} for version check`,
  });

  // Version check
  let remoteIssue: JiraIssue;
  try {
    remoteIssue = await api.getIssue(connectionId, localIssue.key);
  } catch (error) {
    throw new Error(
      `Failed to fetch remote issue: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  logSyncEvent({
    level: 'info',
    operation: 'isolated-sync',
    entityType: 'issue',
    entityKey: localIssue.key,
    message: `Version check: local=${localIssue._remoteVersion}, remote=${remoteIssue.fields.updated}`,
    details: {
      localVersion: localIssue._remoteVersion,
      remoteVersion: remoteIssue.fields.updated,
    },
  });

  // Check for version conflict
  if (remoteIssue.fields.updated !== localIssue._remoteVersion) {
    throw new Error(
      `Version conflict: remote has been modified (local: ${localIssue._remoteVersion}, remote: ${remoteIssue.fields.updated})`
    );
  }

  const payload = op.payload as {
    fields?: Record<string, unknown>;
    transition?: { id: string };
  };

  // Execute the operation
  if (payload.transition) {
    logSyncEvent({
      level: 'info',
      operation: 'push',
      entityType: 'issue',
      entityKey: localIssue.key,
      message: `Transitioning issue ${localIssue.key}`,
      details: { transitionId: payload.transition.id },
    });

    await api.transitionIssue(
      connectionId,
      localIssue.key,
      payload.transition.id
    );
  } else if (payload.fields) {
    logSyncEvent({
      level: 'info',
      operation: 'push',
      entityType: 'issue',
      entityKey: localIssue.key,
      message: `Updating issue ${localIssue.key} fields`,
      details: { fields: Object.keys(payload.fields) },
    });

    await api.updateIssue(connectionId, localIssue.key, {
      fields: payload.fields,
    });
  }

  // Get updated remote version
  const updatedRemote = await api.getIssue(connectionId, localIssue.key);

  // Mark issue as synced
  await issueRepository.put({
    ...localIssue,
    _syncStatus: 'synced',
    _remoteVersion: updatedRemote.fields.updated,
    _syncError: null,
  });

  logSyncEvent({
    level: 'success',
    operation: 'push',
    entityType: 'issue',
    entityKey: localIssue.key,
    message: `Issue ${localIssue.key} synced successfully`,
    details: { newVersion: updatedRemote.fields.updated },
  });
}

async function executeCreateOperation(
  connectionId: string,
  op: PendingOperation
): Promise<void> {
  const localIssue = await issueRepository.getById(op.entityId);
  if (!localIssue) {
    throw new Error('Issue not found locally');
  }

  const payload = op.payload as { fields: Record<string, unknown> };

  logSyncEvent({
    level: 'info',
    operation: 'push',
    entityType: 'issue',
    entityKey: localIssue.key,
    message: `Creating issue ${localIssue.key} on remote`,
    details: { fields: Object.keys(payload.fields) },
  });

  // Create on remote
  const createResult = await api.createIssue(connectionId, {
    fields: payload.fields,
  });

  logSyncEvent({
    level: 'info',
    operation: 'push',
    entityType: 'issue',
    entityKey: createResult.key,
    message: `Issue created: ${createResult.key} (was ${localIssue.key})`,
    details: { newId: createResult.id, newKey: createResult.key },
  });

  // Fetch full issue
  const remoteIssue = await api.getIssue(connectionId, createResult.key);
  const newLocalIssue = mapJiraIssueToLocal(remoteIssue);

  // Replace local issue with remote
  await issueRepository.delete(op.entityId);
  await issueRepository.put(newLocalIssue);

  logSyncEvent({
    level: 'success',
    operation: 'push',
    entityType: 'issue',
    entityKey: createResult.key,
    message: `Issue ${createResult.key} created and synced`,
  });
}

async function executeCommentOperation(
  connectionId: string,
  op: PendingOperation
): Promise<void> {
  const localIssue = await issueRepository.getById(op.entityId);
  if (!localIssue) {
    throw new Error('Issue not found locally');
  }

  const payload = op.payload as { body: unknown };

  logSyncEvent({
    level: 'info',
    operation: 'push',
    entityType: 'comment',
    entityKey: localIssue.key,
    message: `Adding comment to ${localIssue.key}`,
  });

  const response = await api.addComment(
    connectionId,
    localIssue.key,
    payload.body
  );

  // Store the comment locally
  await commentRepository.put({
    id: response.id,
    issueId: op.entityId,
    body: response.body,
    author: response.author.displayName,
    created: response.created,
    updated: response.updated,
    _syncStatus: 'synced',
  });

  logSyncEvent({
    level: 'success',
    operation: 'push',
    entityType: 'comment',
    entityKey: localIssue.key,
    message: `Comment added to ${localIssue.key}`,
    details: { commentId: response.id },
  });
}

/**
 * Delete a pending operation without executing it.
 */
export async function deletePendingOperation(
  operationId: string
): Promise<void> {
  const op = await pendingOperationsRepository.getById(operationId);

  logSyncEvent({
    level: 'warn',
    operation: 'isolated-sync',
    entityType: op?.entityType,
    entityId: op?.entityId,
    message: `Deleting pending operation ${operationId}`,
    details: op,
  });

  await pendingOperationsRepository.delete(operationId);

  // If the entity has no more pending operations, mark it as synced
  if (op) {
    const remaining = await pendingOperationsRepository.getByEntityId(
      op.entityId
    );
    if (remaining.length === 0 && op.entityType === 'issue') {
      const issue = await issueRepository.getById(op.entityId);
      if (issue && issue._syncStatus === 'pending') {
        await issueRepository.put({
          ...issue,
          _syncStatus: 'synced',
        });
      }
    }
  }

  // Update pending count
  const count = await pendingOperationsRepository.count();
  useSyncStore.getState().setPendingCount(count);
}
