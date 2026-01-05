/**
 * Sync engine for synchronizing issues with JIRA.
 *
 * Phase 2: Pull-only sync (no push yet)
 */

import { api, type JiraIssue, type JiraSearchResponse } from "@/lib/api";
import { db, issueRepository, syncMetaRepository } from "@/lib/db";
import { useSyncStore } from "@/stores/syncStore";
import type { Issue } from "@/types";

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
