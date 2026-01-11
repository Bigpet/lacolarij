/**
 * Tests for conflictService
 */

import { describe, it, expect } from 'vitest';
import { getIssueDiff } from './conflictService';
import type { Issue } from '@/types';

describe('conflictService', () => {
  const createMockIssue = (overrides?: Partial<Issue>): Issue => ({
    id: 'issue-1',
    key: 'TEST-1',
    projectKey: 'TEST',
    summary: 'Test issue',
    description: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Test description' }],
        },
      ],
    },
    status: 'Open',
    statusCategory: 'todo',
    assignee: 'alice',
    reporter: 'bob',
    priority: 'High',
    issueType: 'Bug',
    labels: [],
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-01T00:00:00Z',
    _localUpdated: Date.now(),
    _syncStatus: 'conflict',
    _syncError: null,
    _remoteVersion: '1',
    ...overrides,
  });

  describe('getIssueDiff', () => {
    it('should return empty array when issues are identical', () => {
      const local = createMockIssue();
      const remote = createMockIssue();

      const diffs = getIssueDiff(local, remote);

      expect(diffs).toEqual([]);
    });

    describe('summary differences', () => {
      it('should detect summary differences', () => {
        const local = createMockIssue({ summary: 'Local summary' });
        const remote = createMockIssue({ summary: 'Remote summary' });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
          field: 'summary',
          localValue: 'Local summary',
          remoteValue: 'Remote summary',
        });
      });

      it('should detect when only local summary is changed', () => {
        const local = createMockIssue({ summary: 'Changed summary' });
        const remote = createMockIssue({ summary: 'Test issue' });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toHaveLength(1);
        expect(diffs[0].field).toBe('summary');
      });
    });

    describe('status differences', () => {
      it('should detect status differences', () => {
        const local = createMockIssue({
          status: 'In Progress',
          statusCategory: 'indeterminate',
        });
        const remote = createMockIssue({
          status: 'Done',
          statusCategory: 'done',
        });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
          field: 'status',
          localValue: 'In Progress',
          remoteValue: 'Done',
        });
      });
    });

    describe('priority differences', () => {
      it('should detect priority differences', () => {
        const local = createMockIssue({ priority: 'High' });
        const remote = createMockIssue({ priority: 'Low' });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
          field: 'priority',
          localValue: 'High',
          remoteValue: 'Low',
        });
      });
    });

    describe('assignee differences', () => {
      it('should detect assignee differences', () => {
        const local = createMockIssue({ assignee: 'alice' });
        const remote = createMockIssue({ assignee: 'bob' });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
          field: 'assignee',
          localValue: 'alice',
          remoteValue: 'bob',
        });
      });

      it('should detect when local has assignee but remote is null', () => {
        const local = createMockIssue({ assignee: 'alice' });
        const remote = createMockIssue({ assignee: null });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toHaveLength(1);
        expect(diffs[0].field).toBe('assignee');
        expect(diffs[0].localValue).toBe('alice');
        expect(diffs[0].remoteValue).toBeNull();
      });

      it('should detect when local is null but remote has assignee', () => {
        const local = createMockIssue({ assignee: null });
        const remote = createMockIssue({ assignee: 'bob' });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toHaveLength(1);
        expect(diffs[0].field).toBe('assignee');
        expect(diffs[0].localValue).toBeNull();
        expect(diffs[0].remoteValue).toBe('bob');
      });

      it('should treat null assignee as equal to null', () => {
        const local = createMockIssue({ assignee: null });
        const remote = createMockIssue({ assignee: null });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toEqual([]);
      });
    });

    describe('description differences', () => {
      it('should detect description differences when ADF structure differs', () => {
        const local = createMockIssue({
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Local description' }],
              },
            ],
          },
        });
        const remote = createMockIssue({
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Remote description' }],
              },
            ],
          },
        });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
          field: 'description',
          localValue: local.description,
          remoteValue: remote.description,
        });
      });

      it('should detect when local description is null and remote is not', () => {
        const local = createMockIssue({ description: null });
        const remote = createMockIssue({
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Some description' }],
              },
            ],
          },
        });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toHaveLength(1);
        expect(diffs[0].field).toBe('description');
      });

      it('should detect when local description is not null and remote is null', () => {
        const local = createMockIssue({
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Some description' }],
              },
            ],
          },
        });
        const remote = createMockIssue({ description: null });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toHaveLength(1);
        expect(diffs[0].field).toBe('description');
      });

      it('should treat null descriptions as equal', () => {
        const local = createMockIssue({ description: null });
        const remote = createMockIssue({ description: null });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toEqual([]);
      });
    });

    describe('multiple differences', () => {
      it('should detect multiple field differences', () => {
        const local = createMockIssue({
          summary: 'Local summary',
          status: 'In Progress',
          statusCategory: 'indeterminate',
          priority: 'High',
        });
        const remote = createMockIssue({
          summary: 'Remote summary',
          status: 'Done',
          statusCategory: 'done',
          priority: 'Low',
        });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toHaveLength(3);
        expect(diffs.map((d) => d.field)).toEqual(
          expect.arrayContaining(['summary', 'status', 'priority'])
        );
      });
    });

    describe('ignored fields', () => {
      it('should not compare issueType', () => {
        const local = createMockIssue({ issueType: 'Bug' });
        const remote = createMockIssue({ issueType: 'Story' });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toEqual([]);
      });

      it('should not compare labels', () => {
        const local = createMockIssue({ labels: ['bug'] });
        const remote = createMockIssue({ labels: ['feature'] });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toEqual([]);
      });

      it('should not compare reporter', () => {
        const local = createMockIssue({ reporter: 'alice' });
        const remote = createMockIssue({ reporter: 'bob' });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toEqual([]);
      });

      it('should not compare timestamps', () => {
        const local = createMockIssue({ created: '2024-01-01T00:00:00Z' });
        const remote = createMockIssue({ created: '2024-01-02T00:00:00Z' });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toEqual([]);
      });

      it('should not compare sync metadata', () => {
        const local = createMockIssue({
          _syncStatus: 'conflict',
          _localUpdated: 1000,
          _remoteVersion: '1',
        });
        const remote = createMockIssue({
          _syncStatus: 'synced',
          _localUpdated: 2000,
          _remoteVersion: '2',
        });

        const diffs = getIssueDiff(local, remote);

        expect(diffs).toEqual([]);
      });
    });
  });
});
