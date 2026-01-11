/**
 * Tests for syncStore
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSyncStore, type Conflict } from './syncStore';

describe('syncStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useSyncStore.getState().reset();
  });

  describe('initial state', () => {
    it('should have idle status', () => {
      const state = useSyncStore.getState();
      expect(state.status).toBe('idle');
    });

    it('should have null lastSync', () => {
      const state = useSyncStore.getState();
      expect(state.lastSync).toBeNull();
    });

    it('should have zero pendingCount', () => {
      const state = useSyncStore.getState();
      expect(state.pendingCount).toBe(0);
    });

    it('should have empty conflicts array', () => {
      const state = useSyncStore.getState();
      expect(state.conflicts).toEqual([]);
    });

    it('should have null error', () => {
      const state = useSyncStore.getState();
      expect(state.error).toBeNull();
    });

    it('should have null activeConnectionId', () => {
      const state = useSyncStore.getState();
      expect(state.activeConnectionId).toBeNull();
    });

    it('should have isOnline based on navigator', () => {
      const state = useSyncStore.getState();
      expect(state.isOnline).toBe(
        typeof navigator !== 'undefined' ? navigator.onLine : true
      );
    });
  });

  describe('setStatus', () => {
    it('should update status to syncing', () => {
      useSyncStore.getState().setStatus('syncing');

      expect(useSyncStore.getState().status).toBe('syncing');
    });

    it('should update status to error', () => {
      useSyncStore.getState().setStatus('error');

      expect(useSyncStore.getState().status).toBe('error');
    });

    it('should update status to idle', () => {
      useSyncStore.getState().setStatus('syncing');
      useSyncStore.getState().setStatus('idle');

      expect(useSyncStore.getState().status).toBe('idle');
    });
  });

  describe('setLastSync', () => {
    it('should update lastSync date', () => {
      const now = new Date();
      useSyncStore.getState().setLastSync(now);

      expect(useSyncStore.getState().lastSync).toEqual(now);
    });
  });

  describe('setPendingCount', () => {
    it('should update pendingCount', () => {
      useSyncStore.getState().setPendingCount(5);

      expect(useSyncStore.getState().pendingCount).toBe(5);
    });

    it('should handle zero count', () => {
      useSyncStore.getState().setPendingCount(10);
      useSyncStore.getState().setPendingCount(0);

      expect(useSyncStore.getState().pendingCount).toBe(0);
    });
  });

  describe('conflicts', () => {
    const mockConflict: Conflict = {
      id: 'conflict-1',
      entityType: 'issue',
      entityId: 'issue-1',
      entityKey: 'TEST-1',
      field: 'summary',
      localValue: 'Local summary',
      remoteValue: 'Remote summary',
      localTimestamp: Date.now(),
      remoteTimestamp: '2024-01-01T00:00:00Z',
    };

    describe('addConflict', () => {
      it('should add a conflict to the store', () => {
        useSyncStore.getState().addConflict(mockConflict);

        expect(useSyncStore.getState().conflicts).toEqual([mockConflict]);
      });

      it('should add multiple conflicts', () => {
        const conflict2: Conflict = {
          ...mockConflict,
          id: 'conflict-2',
          entityId: 'issue-2',
        };

        useSyncStore.getState().addConflict(mockConflict);
        useSyncStore.getState().addConflict(conflict2);

        expect(useSyncStore.getState().conflicts).toHaveLength(2);
        expect(useSyncStore.getState().conflicts).toEqual(
          expect.arrayContaining([mockConflict, conflict2])
        );
      });

      it('should append conflicts to existing array', () => {
        useSyncStore.getState().addConflict(mockConflict);

        const conflict2: Conflict = {
          ...mockConflict,
          id: 'conflict-2',
          entityId: 'issue-2',
        };
        useSyncStore.getState().addConflict(conflict2);

        const conflicts = useSyncStore.getState().conflicts;
        expect(conflicts[0]).toEqual(mockConflict);
        expect(conflicts[1]).toEqual(conflict2);
      });
    });

    describe('removeConflict', () => {
      beforeEach(() => {
        useSyncStore.getState().addConflict(mockConflict);
      });

      it('should remove a conflict by id', () => {
        expect(useSyncStore.getState().conflicts).toHaveLength(1);

        useSyncStore.getState().removeConflict('conflict-1');

        expect(useSyncStore.getState().conflicts).toEqual([]);
      });

      it('should only remove the specified conflict', () => {
        const conflict2: Conflict = {
          ...mockConflict,
          id: 'conflict-2',
          entityId: 'issue-2',
        };
        useSyncStore.getState().addConflict(conflict2);

        expect(useSyncStore.getState().conflicts).toHaveLength(2);

        useSyncStore.getState().removeConflict('conflict-1');

        const conflicts = useSyncStore.getState().conflicts;
        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].id).toBe('conflict-2');
      });

      it('should handle removing non-existent conflict', () => {
        useSyncStore.getState().removeConflict('non-existent');

        expect(useSyncStore.getState().conflicts).toHaveLength(1);
      });
    });

    describe('clearConflicts', () => {
      it('should clear all conflicts', () => {
        const conflict2: Conflict = {
          ...mockConflict,
          id: 'conflict-2',
          entityId: 'issue-2',
        };
        useSyncStore.getState().addConflict(mockConflict);
        useSyncStore.getState().addConflict(conflict2);

        expect(useSyncStore.getState().conflicts).toHaveLength(2);

        useSyncStore.getState().clearConflicts();

        expect(useSyncStore.getState().conflicts).toEqual([]);
      });

      it('should handle clearing when no conflicts exist', () => {
        expect(useSyncStore.getState().conflicts).toEqual([]);

        useSyncStore.getState().clearConflicts();

        expect(useSyncStore.getState().conflicts).toEqual([]);
      });
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      useSyncStore.getState().setError('Network error');

      expect(useSyncStore.getState().error).toBe('Network error');
    });

    it('should clear error when null is passed', () => {
      useSyncStore.getState().setError('Some error');
      useSyncStore.getState().setError(null);

      expect(useSyncStore.getState().error).toBeNull();
    });
  });

  describe('setActiveConnection', () => {
    it('should set active connection id', () => {
      useSyncStore.getState().setActiveConnection('conn-1');

      expect(useSyncStore.getState().activeConnectionId).toBe('conn-1');
    });

    it('should clear active connection when null is passed', () => {
      useSyncStore.getState().setActiveConnection('conn-1');
      useSyncStore.getState().setActiveConnection(null);

      expect(useSyncStore.getState().activeConnectionId).toBeNull();
    });
  });

  describe('setOnline', () => {
    it('should set online status to true', () => {
      useSyncStore.getState().setOnline(true);

      expect(useSyncStore.getState().isOnline).toBe(true);
    });

    it('should set online status to false', () => {
      useSyncStore.getState().setOnline(false);

      expect(useSyncStore.getState().isOnline).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      // Modify all state values
      useSyncStore.getState().setStatus('syncing');
      useSyncStore.getState().setLastSync(new Date());
      useSyncStore.getState().setPendingCount(10);
      useSyncStore.getState().addConflict({
        id: 'conflict-1',
        entityType: 'issue',
        entityId: 'issue-1',
        localValue: {},
        remoteValue: {},
        localTimestamp: Date.now(),
        remoteTimestamp: '2024-01-01',
      });
      useSyncStore.getState().setError('Error');
      useSyncStore.getState().setActiveConnection('conn-1');
      useSyncStore.getState().setOnline(false);

      // Reset
      useSyncStore.getState().reset();

      // Verify all values are reset
      const state = useSyncStore.getState();
      expect(state.status).toBe('idle');
      expect(state.lastSync).toBeNull();
      expect(state.pendingCount).toBe(0);
      expect(state.conflicts).toEqual([]);
      expect(state.error).toBeNull();
      expect(state.activeConnectionId).toBeNull();
      expect(state.isOnline).toBe(
        typeof navigator !== 'undefined' ? navigator.onLine : true
      );
    });
  });
});
