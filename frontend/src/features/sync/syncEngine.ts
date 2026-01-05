/**
 * Sync engine for synchronizing issues with JIRA.
 *
 * Phase 3: Push and pull sync with conflict detection
 */

import { api, type JiraIssue, type JiraSearchResponse } from "@/lib/api";
import {
  db,
  issueRepository,
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

    // Get last sync time if not doing full sync
    let since: number | undefined;
    if (!fullSync) {
      since = await syncMetaRepository.getLastSyncTime(connectionId);
    }

    // Build JQL for incremental sync
    let searchJql = jql || "";
    if (since && !fullSync) {
      const sinceDate = new Date(since).toISOString().split("T")[0];
      const updateFilter = `updated >= "${sinceDate}"`;
      searchJql = searchJql
        ? `(${searchJql}) AND ${updateFilter}`
        : updateFilter;
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
        await this.mergeRemoteIssue(jiraIssue);
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

  private async mergeRemoteIssue(remote: JiraIssue): Promise<void> {
    const store = useSyncStore.getState();
    const local = await issueRepository.getById(remote.id);

    if (!local) {
      // New issue from remote - add it
      const newIssue = mapJiraIssueToLocal(remote);
      await issueRepository.put(newIssue);
      return;
    }

    if (local._syncStatus === "pending") {
      // Local has unpushed changes - check for conflict
      if (remote.fields.updated !== local._remoteVersion) {
        // Remote changed too - we have a conflict
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
      }
      // If remote hasn't changed, keep local version for future push
    } else {
      // No local changes - just update with remote
      const updatedIssue = mapJiraIssueToLocal(remote);
      await issueRepository.put(updatedIssue);
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
      // Only process issue operations for now
      if (op.entityType !== "issue") {
        continue;
      }

      try {
        // Get local issue to check version
        const localIssue = await issueRepository.getById(op.entityId);
        if (!localIssue) {
          // Issue was deleted locally, remove pending op
          await pendingOperationsRepository.delete(op.id);
          continue;
        }

        // Skip if already in conflict
        if (localIssue._syncStatus === "conflict") {
          console.log(`Skipping ${localIssue.key} - already in conflict`);
          continue;
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
          continue;
        }

        // Check for version conflict
        if (remoteIssue.fields.updated !== localIssue._remoteVersion) {
          console.log(`Conflict detected for ${localIssue.key}`);
          await this.handlePushConflict(localIssue, remoteIssue, op.id);
          continue;
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
      } catch (error) {
        console.error(`Failed to push operation for ${op.entityId}:`, error);

        // Check if it's a conflict error (409)
        if (this.isConflictError(error)) {
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

    // Update local issue to conflict status
    await issueRepository.put({
      ...localIssue,
      _syncStatus: "conflict",
    });

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
    return navigator.onLine;
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
    isOnline: syncEngine.isOnline(),
  };
}
