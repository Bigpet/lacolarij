import { describe, it, expect, beforeEach } from 'vitest';
import { db, issueRepository } from './index';
import type { Issue } from '@/types';

function createMockIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: crypto.randomUUID(),
    key: 'TEST-1',
    projectKey: 'TEST',
    summary: 'Test issue',
    description: null,
    status: 'To Do',
    statusCategory: 'todo',
    assignee: null,
    reporter: 'user@example.com',
    priority: 'Medium',
    issueType: 'Task',
    labels: [],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    _localUpdated: Date.now(),
    _syncStatus: 'synced',
    _syncError: null,
    _remoteVersion: '1',
    ...overrides,
  };
}

describe('issueRepository', () => {
  beforeEach(async () => {
    await db.issues.clear();
  });

  describe('put', () => {
    it('stores an issue and returns its id', async () => {
      const issue = createMockIssue({ id: 'test-id' });
      const id = await issueRepository.put(issue);
      expect(id).toBe('test-id');
    });

    it('updates an existing issue', async () => {
      const issue = createMockIssue();
      await issueRepository.put(issue);

      const updated = { ...issue, summary: 'Updated summary' };
      await issueRepository.put(updated);

      const retrieved = await issueRepository.getById(issue.id);
      expect(retrieved?.summary).toBe('Updated summary');
    });
  });

  describe('getById', () => {
    it('returns undefined for non-existent issue', async () => {
      const result = await issueRepository.getById('non-existent');
      expect(result).toBeUndefined();
    });

    it('returns the issue when it exists', async () => {
      const issue = createMockIssue();
      await issueRepository.put(issue);

      const result = await issueRepository.getById(issue.id);
      expect(result).toEqual(issue);
    });
  });

  describe('getByKey', () => {
    it('returns undefined for non-existent key', async () => {
      const result = await issueRepository.getByKey('NONE-1');
      expect(result).toBeUndefined();
    });

    it('returns the issue by key', async () => {
      const issue = createMockIssue({ key: 'PROJ-123' });
      await issueRepository.put(issue);

      const result = await issueRepository.getByKey('PROJ-123');
      expect(result?.key).toBe('PROJ-123');
    });
  });

  describe('getByStatusCategory', () => {
    it('returns empty array when no matching issues', async () => {
      const result = await issueRepository.getByStatusCategory('done');
      expect(result).toEqual([]);
    });

    it('returns issues by status category', async () => {
      const todo1 = createMockIssue({ statusCategory: 'todo' });
      const todo2 = createMockIssue({ statusCategory: 'todo', key: 'TEST-2' });
      const done = createMockIssue({ statusCategory: 'done', key: 'TEST-3' });

      await issueRepository.bulkPut([todo1, todo2, done]);

      const todoIssues = await issueRepository.getByStatusCategory('todo');
      expect(todoIssues).toHaveLength(2);

      const doneIssues = await issueRepository.getByStatusCategory('done');
      expect(doneIssues).toHaveLength(1);
    });
  });

  describe('getPending', () => {
    it('returns empty array when no pending issues', async () => {
      const issue = createMockIssue({ _syncStatus: 'synced' });
      await issueRepository.put(issue);

      const result = await issueRepository.getPending();
      expect(result).toEqual([]);
    });

    it('returns only pending issues', async () => {
      const synced = createMockIssue({ _syncStatus: 'synced' });
      const pending = createMockIssue({
        _syncStatus: 'pending',
        key: 'TEST-2',
      });
      const conflict = createMockIssue({
        _syncStatus: 'conflict',
        key: 'TEST-3',
      });

      await issueRepository.bulkPut([synced, pending, conflict]);

      const result = await issueRepository.getPending();
      expect(result).toHaveLength(1);
      expect(result[0]._syncStatus).toBe('pending');
    });
  });

  describe('bulkPut', () => {
    it('stores multiple issues at once', async () => {
      const issues = [
        createMockIssue({ key: 'TEST-1' }),
        createMockIssue({ key: 'TEST-2' }),
        createMockIssue({ key: 'TEST-3' }),
      ];

      await issueRepository.bulkPut(issues);

      const count = await issueRepository.count();
      expect(count).toBe(3);
    });
  });

  describe('delete', () => {
    it('removes an issue by id', async () => {
      const issue = createMockIssue();
      await issueRepository.put(issue);

      await issueRepository.delete(issue.id);

      const result = await issueRepository.getById(issue.id);
      expect(result).toBeUndefined();
    });

    it('does nothing for non-existent id', async () => {
      // Should not throw
      await issueRepository.delete('non-existent');
    });
  });

  describe('getAll', () => {
    it('returns all issues', async () => {
      const issues = [
        createMockIssue({ key: 'TEST-1' }),
        createMockIssue({ key: 'TEST-2' }),
      ];
      await issueRepository.bulkPut(issues);

      const result = await issueRepository.getAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('search', () => {
    it('searches by key', async () => {
      const issue = createMockIssue({ key: 'PROJ-123' });
      await issueRepository.put(issue);

      const result = await issueRepository.search('PROJ');
      expect(result).toHaveLength(1);
    });

    it('searches by summary', async () => {
      const issue = createMockIssue({ summary: 'Fix login bug' });
      await issueRepository.put(issue);

      const result = await issueRepository.search('login');
      expect(result).toHaveLength(1);
    });

    it('is case insensitive', async () => {
      const issue = createMockIssue({ summary: 'Fix LOGIN Bug' });
      await issueRepository.put(issue);

      const result = await issueRepository.search('login');
      expect(result).toHaveLength(1);
    });
  });
});
