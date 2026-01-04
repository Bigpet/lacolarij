/**
 * IndexedDB schema using Dexie.
 */

import Dexie, { type Table } from "dexie";
import type { Issue, Comment, SyncMeta, PendingOperation } from "@/types";

export class JiraLocalDB extends Dexie {
  issues!: Table<Issue, string>;
  comments!: Table<Comment, string>;
  syncMeta!: Table<SyncMeta, string>;
  pendingOperations!: Table<PendingOperation, string>;

  constructor() {
    super("jiralocal");

    this.version(1).stores({
      // Primary key is first, then indexed fields
      issues: "id, key, projectKey, status, statusCategory, assignee, _syncStatus",
      comments: "id, issueId",
      syncMeta: "id",
      pendingOperations: "id, entityType, entityId, createdAt",
    });
  }
}

export const db = new JiraLocalDB();
