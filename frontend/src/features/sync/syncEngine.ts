/**
 * Sync engine for synchronizing issues with JIRA.
 *
 * Phase 3: Push and pull sync with conflict detection
 */

import { api, type JiraIssue, type JiraSearchResponse } from "@/lib/api";
import {
  db,
  issueRepository,
  commentRepository,
  syncMetaRepository,
  pendingOperationsRepository,
} from "@/lib/db";
import { useSyncStore } from "@/stores/syncStore";
import type { Issue, PendingOperation } from "@/types";

// Map status category from JIRA to our simplified version
function mapStatusCategory(
  category: string
): "todo" | "indeterminate" | "done" {
  switch (category.toLowerCase()) {
    case "new":
    case "undefined":
      return "todo";
    case "done":
      return "done";
    default:
      return "indeterminate";
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
    reporter: fields.reporter?.displayName || "",
    priority: fields.priority?.name || "Medium",
    issueType: fields.issuetype.name,
    labels: fields.labels || [],
    created: fields.created,
    updated: fields.updated,
    _localUpdated: Date.now(),
    _syncStatus: "synced",
    _syncError: null,
    _remoteVersion: fields.updated,
  };
}

// Convert JIRA comment to local comment format
function mapJiraCommentToLocal(jiraComment: { id: string; body: unknown; author: { displayName: string }; created: string; updated: string }, issueId: string) {
  return {
    id: jiraComment.id,
    issueId,
    body: jiraComment.body,
    author: jiraComment.author.displayName,
    created: jiraComment.created,
    updated: jiraComment.updated,
    _syncStatus: "synced" as const,
  };
}

export interface SyncOptions {
  connectionId: string;
  jql?: string;
  fullSync?: boolean;
  maxResults?: number;
}

export class SyncEngine {
  private isRunning = false;

  async startSync(options: SyncOptions): Promise<void> {
    if (this.isRunning) {
      console.warn("Sync already in progress");
      return;
    }

    const store = useSyncStore.getState();

    // Check connectivity before syncing
    if (!store.isOnline) {
      console.log("Cannot sync while offline");
      return;
    }

    this.isRunning = true;
    store.setStatus("syncing");
    store.setError(null);
    store.setActiveConnection(options.connectionId);

    try {
      // Push local changes first (before pull to minimize conflicts)
      await this.pushPendingChanges(options.connectionId);

      // Pull remote changes
      await this.pullRemoteChanges(options);

      store.setStatus("idle");
      store.setLastSync(new Date());

      // Update pending count
      const pendingCount = await db.pendingOperations.count();
      store.setPendingCount(pendingCount);
    } catch (error) {
      console.error("Sync error:", error);
      store.setStatus("error");
      store.setError(error instanceof Error ? error.message : "Sync failed");
    } finally {
      this.isRunning = false;
    }
  }

  private async pullRemoteChanges(options: SyncOptions): Promise<void> {
    const { connectionId, jql, fullSync, maxResults = 100 } = options;

    console.log(`[syncEngine] pullRemoteChanges: fullSync=${fullSync}, connectionId=${connectionId}`);

    // Get last sync time if not doing full sync
    let since: number | undefined;
    if (!fullSync) {
      since = await syncMetaRepository.getLastSyncTime(connectionId);
      console.log(`[syncEngine]   since=${since}, ${since ? new Date(since).toISOString() : 'never'}`);
    }

    // Build JQL for incremental sync
    let searchJql = jql || "";
    if (since && !fullSync) {
      const sinceDate = new Date(since).toISOString().split("T")[0];
      const updateFilter = `updated >= "${sinceDate}"`;
      searchJql = searchJql
        ? `(${searchJql}) AND ${updateFilter}`
        : updateFilter;
      console.log(`[syncEngine]   using incremental JQL: ${searchJql}`);
    }

    // Add ordering for consistent pagination
    if (!searchJql.toLowerCase().includes("order by")) {
      searchJql = searchJql
        ? `${searchJql} ORDER BY updated ASC`
        : "created >= -3000w ORDER BY updated ASC";
    }

    let nextPageToken: string | undefined = undefined;
    let totalFetched = 0;

    while (true) {
      // Fetch a batch of issues
      const response: JiraSearchResponse = await api.searchIssues(
        connectionId,
        {
          jql: searchJql,
          nextPageToken,
          maxResults,
          fields: [
            "summary",
            "description",
            "status",
            "issuetype",
            "priority",
            "assignee",
            "reporter",
            "project",
            "labels",
            "created",
            "updated",
          ],
        }
      );

      // Process issues
      for (const jiraIssue of response.issues) {
        console.log(`[syncEngine] Processing issue ${jiraIssue.key}...`);
        await this.mergeRemoteIssue(jiraIssue, options.connectionId);
      }

      totalFetched += response.issues.length;

      // Check if there's a next page
      if (!response.nextPageToken) {
        break;
      }

      nextPageToken = response.nextPageToken;
    }

    console.log(`Synced ${totalFetched} issues`);

    // Update sync metadata
    await syncMetaRepository.setLastSyncTime(connectionId, Date.now());
  }

  private async mergeRemoteIssue(remote: JiraIssue, connectionId: string): Promise<void> {
    console.log(`[syncEngine] mergeRemoteIssue called for ${remote.key}, connectionId=${connectionId}`);
    const store = useSyncStore.getState();
    const local = await issueRepository.getById(remote.id);

    if (!local) {
      // New issue from remote - add it
      const newIssue = mapJiraIssueToLocal(remote);
      await issueRepository.put(newIssue);

      // Fetch and store comments for the new issue
      await this.syncCommentsForIssue(connectionId, remote.id, remote.key);
      return;
    }

    console.log(`[syncEngine] local._syncStatus for ${remote.key}: ${local._syncStatus}`);

    if (local._syncStatus === "conflict") {
      // Issue is already in conflict - preserve local version, update remote value in conflict store
      console.log(`[syncEngine] Issue ${remote.key} is in conflict, preserving local version`);

      // Find the existing conflict for this issue
      const existingConflict = store.conflicts.find(
        (c) => c.entityId === local.id && c.entityType === "issue"
      );

      if (existingConflict) {
        // Update the remote value if it changed
        if (existingConflict.remoteTimestamp !== remote.fields.updated) {
          store.updateConflict(existingConflict.id, {
            remoteValue: mapJiraIssueToLocal(remote),
            remoteTimestamp: remote.fields.updated,
          });
        }
      }

      // Skip updating the issue in IndexedDB - preserve local version
      return;
    }

    if (local._syncStatus === "pending") {
      // Local has unpushed changes - check for conflict
      console.log(`[syncEngine] Issue ${remote.key} has pending changes, checking for conflict`);
      console.log(`[syncEngine] remote.updated=${remote.fields.updated}, local._remoteVersion=${local._remoteVersion}`);
      if (remote.fields.updated !== local._remoteVersion) {
        // Remote changed too - we have a conflict
        console.log(`[syncEngine] CONFLICT detected for ${remote.key}`);
        await issueRepository.put({
          ...local,
          _syncStatus: "conflict",
          _remoteVersion: remote.fields.updated,
        });

        store.addConflict({
          id: `${local.id}-${Date.now()}`,
          entityType: "issue",
          entityId: local.id,
          entityKey: local.key,
          localValue: local,
          remoteValue: mapJiraIssueToLocal(remote),
          localTimestamp: local._localUpdated,
          remoteTimestamp: remote.fields.updated,
        });
      } else {
        // No conflict - keep local version for future push
        console.log(`[syncEngine] No conflict for ${remote.key}, keeping pending status`);
      }
    } else {
      // No local changes - just update with remote
      console.log(`[syncEngine] No local changes for ${remote.key}, updating from remote`);
      const updatedIssue = mapJiraIssueToLocal(remote);
      await issueRepository.put(updatedIssue);
    }

    // Always sync comments for issue
    await this.syncCommentsForIssue(connectionId, remote.id, remote.key);
  }

  /**
   * Sync comments for an issue from JIRA.
   */
  private async syncCommentsForIssue(
    connectionId: string,
    issueId: string,
    issueKey: string
  ): Promise<void> {
    try {
      console.log(`[syncEngine] Fetching comments for ${issueKey} (issueId=${issueId})...`);
      const response = await api.getComments(connectionId, issueKey);

      console.log(`[syncEngine] Got ${response.comments.length} comments for ${issueKey}, total=${response.total}`);

      // Convert JIRA comments to local format
      const localComments = response.comments.map((jiraComment) =>
        mapJiraCommentToLocal(jiraComment, issueId)
      );

      console.log(`[syncEngine] Mapped ${localComments.length} comments to local format`);

      // Store all comments (replaces existing)
      await commentRepository.deleteByIssueId(issueId);
      if (localComments.length > 0) {
        await commentRepository.bulkPut(localComments);
        console.log(`[syncEngine] Stored ${localComments.length} comments for ${issueKey}`);
      } else {
        console.log(`[syncEngine] No comments to store for ${issueKey}`);
      }
    } catch (error) {
      console.error(`[syncEngine] Failed to sync comments for ${issueKey}:`, error);
      // Don't fail the entire sync if comments fail
    }
  }

  /**
   * Push all pending local changes to JIRA.
   */
  private async pushPendingChanges(connectionId: string): Promise<void> {
    const store = useSyncStore.getState();
    const pending = await pendingOperationsRepository.getAll();

    if (pending.length === 0) {
      console.log("No pending changes to push");
      return;
    }

    console.log(`Pushing ${pending.length} pending changes`);

    for (const op of pending) {
      // Process both issue and comment operations
      if (op.entityType !== "issue" && op.entityType !== "comment") {
        continue;
      }

      try {
        if (op.entityType === "comment") {
          await this.executePendingCommentOperation(connectionId, op);
        } else {
          await this.executePendingIssueOperation(connectionId, op);
        }
      } catch (error) {
        console.error(`Failed to push operation for ${op.entityId}:`, error);

        // Check if it's a conflict error (409)
        if (this.isConflictError(error)) {
          if (op.entityType === "issue") {
            const localIssue = await issueRepository.getById(op.entityId);
            if (localIssue) {
              try {
                const remoteIssue = await api.getIssue(connectionId, localIssue.key);
                await this.handlePushConflict(localIssue, remoteIssue, op.id);
              } catch {
                // Failed to get remote, just mark attempt
                await pendingOperationsRepository.updateAttempt(
                  op.id,
                  "Conflict detected but failed to fetch remote version"
                );
              }
            }
          }
          // For comments, just mark the attempt for now
          await pendingOperationsRepository.updateAttempt(
            op.id,
            "Conflict detected"
          );
        } else {
          // Retry later
          await pendingOperationsRepository.updateAttempt(
            op.id,
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    }

    // Update pending count
    const remaining = await pendingOperationsRepository.count();
    store.setPendingCount(remaining);
  }

  /**
   * Execute a single pending issue operation.
   */
  private async executePendingIssueOperation(
    connectionId: string,
    op: PendingOperation
  ): Promise<void> {
    const localIssue = await issueRepository.getById(op.entityId);
    if (!localIssue) {
      // Issue was deleted locally, remove pending op
      await pendingOperationsRepository.delete(op.id);
      return;
    }

    // Skip if already in conflict
    if (localIssue._syncStatus === "conflict") {
      console.log(`Skipping ${localIssue.key} - already in conflict`);
      return;
    }

    // Version check: GET current issue from JIRA
    let remoteIssue: JiraIssue;
    try {
      remoteIssue = await api.getIssue(connectionId, localIssue.key);
    } catch (error) {
      // Issue might not exist on server (new issue) - handle separately
      console.error(`Failed to fetch remote issue ${localIssue.key}:`, error);
      await pendingOperationsRepository.updateAttempt(
        op.id,
        error instanceof Error ? error.message : "Failed to fetch remote"
      );
      return;
    }

    console.log(`[syncEngine] executePendingIssueOperation for ${localIssue.key}:`);
    console.log(`[syncEngine]   local._remoteVersion: ${localIssue._remoteVersion}`);
    console.log(`[syncEngine]   remote.updated: ${remoteIssue.fields.updated}`);
    console.log(`[syncEngine]   versions match? ${remoteIssue.fields.updated === localIssue._remoteVersion}`);

    // Check for version conflict
    if (remoteIssue.fields.updated !== localIssue._remoteVersion) {
      console.log(`Conflict detected for ${localIssue.key}`);
      await this.handlePushConflict(localIssue, remoteIssue, op.id);
      // Remove the pending operation since we're not pushing it
      await pendingOperationsRepository.delete(op.id);
      return;
    }

    // Execute the operation
    await this.executePendingOperation(connectionId, op, localIssue);

    // Get updated remote version after push
    const updatedRemote = await api.getIssue(connectionId, localIssue.key);

    // Mark issue as synced with new version
    await issueRepository.put({
      ...localIssue,
      _syncStatus: "synced",
      _remoteVersion: updatedRemote.fields.updated,
      _syncError: null,
    });

    // Remove pending operation
    await pendingOperationsRepository.delete(op.id);

    console.log(`Successfully pushed ${localIssue.key}`);
  }

  /**
   * Execute a single pending comment operation.
   */
  private async executePendingCommentOperation(
    connectionId: string,
    op: PendingOperation
  ): Promise<void> {
    // Get the issue to find the key
    const localIssue = await issueRepository.getById(op.entityId);
    if (!localIssue) {
      // Issue was deleted locally, remove pending op
      await pendingOperationsRepository.delete(op.id);
      return;
    }

    const payload = op.payload as { body: unknown };

    // Execute the add comment operation
    const response = await api.addComment(connectionId, localIssue.key, payload.body);

    // Convert response to local format and store
    const localComment = {
      id: response.id,
      issueId: op.entityId,
      body: response.body,
      author: response.author.displayName,
      created: response.created,
      updated: response.updated,
      _syncStatus: "synced" as const,
    };

    await commentRepository.put(localComment);

    // Remove pending operation
    await pendingOperationsRepository.delete(op.id);

    console.log(`Successfully pushed comment for ${localIssue.key}`);
  }

  /**
   * Execute a single pending operation.
   */
  private async executePendingOperation(
    connectionId: string,
    op: PendingOperation,
    localIssue: Issue
  ): Promise<void> {
    const payload = op.payload as {
      fields?: Record<string, unknown>;
      transition?: { id: string };
    };

    if (payload.transition) {
      // Handle status transition
      await api.transitionIssue(
        connectionId,
        localIssue.key,
        payload.transition.id
      );
    } else if (payload.fields) {
      // Handle field update
      await api.updateIssue(connectionId, localIssue.key, {
        fields: payload.fields,
      });
    }
  }

  /**
   * Handle a conflict detected during push.
   */
  private async handlePushConflict(
    localIssue: Issue,
    remoteIssue: JiraIssue,
    _pendingOpId: string
  ): Promise<void> {
    const store = useSyncStore.getState();

    console.log(`[syncEngine] handlePushConflict for ${localIssue.key}`);
    console.log(`[syncEngine]   local.summary: ${localIssue.summary}`);
    console.log(`[syncEngine]   remote.summary: ${remoteIssue.fields.summary}`);
    console.log(`[syncEngine]   local._remoteVersion: ${localIssue._remoteVersion}`);
    console.log(`[syncEngine]   remote.updated: ${remoteIssue.fields.updated}`);

    // Update local issue to conflict status
    await issueRepository.put({
      ...localIssue,
      _syncStatus: "conflict",
    });

    console.log(`[syncEngine]   Marked ${localIssue.key} as conflict in IndexedDB`);

    // Add conflict to store
    store.addConflict({
      id: `${localIssue.id}-${Date.now()}`,
      entityType: "issue",
      entityId: localIssue.id,
      entityKey: localIssue.key,
      localValue: localIssue,
      remoteValue: mapJiraIssueToLocal(remoteIssue),
      localTimestamp: localIssue._localUpdated,
      remoteTimestamp: remoteIssue.fields.updated,
    });

    console.log(`[syncEngine]   Added conflict to syncStore`);
  }

  /**
   * Check if an error is a conflict error (HTTP 409).
   */
  private isConflictError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes("409") || error.message.includes("Conflict");
    }
    return false;
  }

  async syncSingleIssue(
    connectionId: string,
    issueKey: string
  ): Promise<Issue> {
    const store = useSyncStore.getState();

    try {
      const jiraIssue = await api.getIssue(connectionId, issueKey);
      const issue = mapJiraIssueToLocal(jiraIssue);
      await issueRepository.put(issue);
      return issue;
    } catch (error) {
      store.setError(
        error instanceof Error ? error.message : "Failed to fetch issue"
      );
      throw error;
    }
  }

  getStatus() {
    return useSyncStore.getState().status;
  }

  isOnline(): boolean {
    return useSyncStore.getState().isOnline;
  }
}

// Singleton instance
export const syncEngine = new SyncEngine();

// React hook for using sync engine
export function useSync() {
  const store = useSyncStore();

  const sync = async (options: SyncOptions) => {
    await syncEngine.startSync(options);
  };

  const syncIssue = async (connectionId: string, issueKey: string) => {
    return syncEngine.syncSingleIssue(connectionId, issueKey);
  };

  return {
    sync,
    syncIssue,
    status: store.status,
    lastSync: store.lastSync,
    pendingCount: store.pendingCount,
    conflicts: store.conflicts,
    error: store.error,
    isOnline: store.isOnline,
  };
}
