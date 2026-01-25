/**
 * Dexie database for local-first storage.
 */

import Dexie, { type Table } from 'dexie';
import type { Issue, Comment, SyncMeta, PendingOperation } from '@/types';
import { generateUUID } from '@/lib/utils';

export class JiraLocalDatabase extends Dexie {
  issues!: Table<Issue, string>;
  comments!: Table<Comment, string>;
  syncMeta!: Table<SyncMeta, string>;
  pendingOperations!: Table<PendingOperation, string>;

  constructor() {
    super('jiralocal');

    this.version(1).stores({
      // Primary key is 'id', indexed by key, projectKey, status, etc.
      issues:
        'id, key, projectKey, status, statusCategory, assignee, _syncStatus, _localUpdated',
      comments: 'id, issueId, _syncStatus, created',
      syncMeta: 'id',
      pendingOperations: 'id, entityType, entityId, createdAt',
    });
  }
}

// Singleton database instance
export const db = new JiraLocalDatabase();

// Issue repository functions
export const issueRepository = {
  async getAll(): Promise<Issue[]> {
    return db.issues.toArray();
  },

  async getByKey(key: string): Promise<Issue | undefined> {
    return db.issues.where('key').equals(key).first();
  },

  async getById(id: string): Promise<Issue | undefined> {
    return db.issues.get(id);
  },

  async getByProject(projectKey: string): Promise<Issue[]> {
    return db.issues.where('projectKey').equals(projectKey).toArray();
  },

  async getByStatus(status: string): Promise<Issue[]> {
    return db.issues.where('status').equals(status).toArray();
  },

  async getByStatusCategory(
    category: 'todo' | 'indeterminate' | 'done'
  ): Promise<Issue[]> {
    return db.issues.where('statusCategory').equals(category).toArray();
  },

  async getPending(): Promise<Issue[]> {
    return db.issues.where('_syncStatus').equals('pending').toArray();
  },

  async getConflicts(): Promise<Issue[]> {
    return db.issues.where('_syncStatus').equals('conflict').toArray();
  },

  async put(issue: Issue): Promise<string> {
    return db.issues.put(issue);
  },

  async bulkPut(issues: Issue[]): Promise<void> {
    await db.issues.bulkPut(issues);
  },

  async delete(id: string): Promise<void> {
    await db.issues.delete(id);
  },

  async clear(): Promise<void> {
    await db.issues.clear();
  },

  async count(): Promise<number> {
    return db.issues.count();
  },

  async search(query: string): Promise<Issue[]> {
    const lowerQuery = query.toLowerCase();
    return db.issues
      .filter(
        (issue) =>
          issue.key.toLowerCase().includes(lowerQuery) ||
          issue.summary.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  },
};

// Comment repository functions
export const commentRepository = {
  async getByIssueId(issueId: string): Promise<Comment[]> {
    return db.comments.where('issueId').equals(issueId).sortBy('created');
  },

  async put(comment: Comment): Promise<string> {
    return db.comments.put(comment);
  },

  async bulkPut(comments: Comment[]): Promise<void> {
    await db.comments.bulkPut(comments);
  },

  async delete(id: string): Promise<void> {
    await db.comments.delete(id);
  },

  async deleteByIssueId(issueId: string): Promise<void> {
    await db.comments.where('issueId').equals(issueId).delete();
  },
};

// Sync metadata repository
export const syncMetaRepository = {
  async get(id: string): Promise<SyncMeta | undefined> {
    return db.syncMeta.get(id);
  },

  async put(meta: SyncMeta): Promise<string> {
    return db.syncMeta.put(meta);
  },

  async getLastSyncTime(connectionId: string): Promise<number | undefined> {
    const meta = await db.syncMeta.get(connectionId);
    return meta?.lastSyncTime;
  },

  async setLastSyncTime(
    connectionId: string,
    time: number,
    cursor?: string | null
  ): Promise<void> {
    await db.syncMeta.put({
      id: connectionId,
      lastSyncTime: time,
      lastSyncCursor: cursor ?? null,
    });
  },
};

// Pending operations queue
export const pendingOperationsRepository = {
  async getAll(): Promise<PendingOperation[]> {
    return db.pendingOperations.orderBy('createdAt').toArray();
  },

  async getById(id: string): Promise<PendingOperation | undefined> {
    return db.pendingOperations.get(id);
  },

  async getByEntityId(entityId: string): Promise<PendingOperation[]> {
    return db.pendingOperations.where('entityId').equals(entityId).toArray();
  },

  async add(operation: Omit<PendingOperation, 'id'>): Promise<string> {
    const id = generateUUID();
    await db.pendingOperations.add({ ...operation, id });
    return id;
  },

  async delete(id: string): Promise<void> {
    await db.pendingOperations.delete(id);
  },

  async deleteByEntityId(entityId: string): Promise<void> {
    await db.pendingOperations.where('entityId').equals(entityId).delete();
  },

  async updateAttempt(id: string, error: string | null): Promise<void> {
    const op = await db.pendingOperations.get(id);
    if (op) {
      await db.pendingOperations.update(id, {
        attempts: op.attempts + 1,
        lastError: error,
      });
    }
  },

  async count(): Promise<number> {
    return db.pendingOperations.count();
  },

  async clear(): Promise<void> {
    await db.pendingOperations.clear();
  },
};
