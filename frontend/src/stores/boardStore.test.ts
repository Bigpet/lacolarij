/**
 * Tests for boardStore
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from './boardStore';

describe('boardStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useBoardStore.getState().resetColumns();
    useBoardStore.getState().clearFilters();
  });

  describe('initial state', () => {
    it('should have empty activeFilters', () => {
      expect(useBoardStore.getState().activeFilters).toEqual([]);
    });

    it('should have default columns', () => {
      const columns = useBoardStore.getState().columns;

      expect(columns).toHaveLength(3);
      expect(columns[0].id).toBe('todo');
      expect(columns[1].id).toBe('in-progress');
      expect(columns[2].id).toBe('done');
    });

    it('should have empty searchTerm', () => {
      expect(useBoardStore.getState().searchTerm).toBe('');
    });

    it('should have all columns visible by default', () => {
      const columns = useBoardStore.getState().columns;

      expect(columns.every((col) => col.visible)).toBe(true);
    });
  });

  describe('toggleFilter', () => {
    it('should add filter when not active', () => {
      useBoardStore.getState().toggleFilter('urgent');

      expect(useBoardStore.getState().activeFilters).toContain('urgent');
    });

    it('should remove filter when already active', () => {
      useBoardStore.getState().toggleFilter('urgent');
      expect(useBoardStore.getState().activeFilters).toContain('urgent');

      useBoardStore.getState().toggleFilter('urgent');
      expect(useBoardStore.getState().activeFilters).not.toContain('urgent');
    });

    it('should handle multiple filters', () => {
      useBoardStore.getState().toggleFilter('urgent');
      useBoardStore.getState().toggleFilter('bug');
      useBoardStore.getState().toggleFilter('frontend');

      expect(useBoardStore.getState().activeFilters).toEqual([
        'urgent',
        'bug',
        'frontend',
      ]);
    });

    it('should toggle independently', () => {
      useBoardStore.getState().toggleFilter('urgent');
      useBoardStore.getState().toggleFilter('bug');

      useBoardStore.getState().toggleFilter('urgent');

      expect(useBoardStore.getState().activeFilters).toEqual(['bug']);
    });
  });

  describe('clearFilters', () => {
    it('should clear all active filters', () => {
      useBoardStore.getState().toggleFilter('urgent');
      useBoardStore.getState().toggleFilter('bug');

      expect(useBoardStore.getState().activeFilters).toHaveLength(2);

      useBoardStore.getState().clearFilters();

      expect(useBoardStore.getState().activeFilters).toEqual([]);
    });

    it('should clear search term', () => {
      useBoardStore.getState().setSearchTerm('test query');

      expect(useBoardStore.getState().searchTerm).toBe('test query');

      useBoardStore.getState().clearFilters();

      expect(useBoardStore.getState().searchTerm).toBe('');
    });

    it('should handle clearing when no filters exist', () => {
      expect(useBoardStore.getState().activeFilters).toEqual([]);

      useBoardStore.getState().clearFilters();

      expect(useBoardStore.getState().activeFilters).toEqual([]);
    });
  });

  describe('setSearchTerm', () => {
    it('should set search term', () => {
      useBoardStore.getState().setSearchTerm('login bug');

      expect(useBoardStore.getState().searchTerm).toBe('login bug');
    });

    it('should clear search term with empty string', () => {
      useBoardStore.getState().setSearchTerm('test');
      expect(useBoardStore.getState().searchTerm).toBe('test');

      useBoardStore.getState().setSearchTerm('');

      expect(useBoardStore.getState().searchTerm).toBe('');
    });
  });

  describe('setColumns', () => {
    it('should replace all columns', () => {
      const newColumns = [
        {
          id: 'backlog',
          title: 'Backlog',
          statusCategory: 'todo' as const,
          statuses: ['Backlog'],
          colorClass: 'bg-gray-100',
          visible: true,
        },
      ];

      useBoardStore.getState().setColumns(newColumns);

      expect(useBoardStore.getState().columns).toEqual(newColumns);
    });
  });

  describe('toggleColumnVisibility', () => {
    it('should hide a visible column', () => {
      const columns = useBoardStore.getState().columns;
      const todoColumn = columns.find((c) => c.id === 'todo');
      expect(todoColumn?.visible).toBe(true);

      useBoardStore.getState().toggleColumnVisibility('todo');

      const updatedColumns = useBoardStore.getState().columns;
      const updatedTodo = updatedColumns.find((c) => c.id === 'todo');
      expect(updatedTodo?.visible).toBe(false);
    });

    it('should show a hidden column', () => {
      useBoardStore.getState().toggleColumnVisibility('todo');

      const columns = useBoardStore.getState().columns;
      const todoColumn = columns.find((c) => c.id === 'todo');
      expect(todoColumn?.visible).toBe(false);

      useBoardStore.getState().toggleColumnVisibility('todo');

      const updatedColumns = useBoardStore.getState().columns;
      const updatedTodo = updatedColumns.find((c) => c.id === 'todo');
      expect(updatedTodo?.visible).toBe(true);
    });

    it('should not affect other columns', () => {
      useBoardStore.getState().toggleColumnVisibility('todo');

      const columns = useBoardStore.getState().columns;
      const todoColumn = columns.find((c) => c.id === 'todo');
      const inProgressColumn = columns.find((c) => c.id === 'in-progress');
      const doneColumn = columns.find((c) => c.id === 'done');

      expect(todoColumn?.visible).toBe(false);
      expect(inProgressColumn?.visible).toBe(true);
      expect(doneColumn?.visible).toBe(true);
    });
  });

  describe('updateColumnStatuses', () => {
    it('should update statuses for a column', () => {
      const columns = useBoardStore.getState().columns;
      const todoColumn = columns.find((c) => c.id === 'todo');
      expect(todoColumn?.statuses).toEqual(['To Do', 'Open', 'Backlog', 'New']);

      useBoardStore
        .getState()
        .updateColumnStatuses('todo', ['To Do', 'Backlog']);

      const updatedColumns = useBoardStore.getState().columns;
      const updatedTodo = updatedColumns.find((c) => c.id === 'todo');
      expect(updatedTodo?.statuses).toEqual(['To Do', 'Backlog']);
    });

    it('should not affect other columns', () => {
      const originalInProgressStatuses = [
        'In Progress',
        'In Review',
        'In Development',
        'Testing',
      ];

      useBoardStore.getState().updateColumnStatuses('todo', ['To Do']);

      const columns = useBoardStore.getState().columns;
      const inProgressColumn = columns.find((c) => c.id === 'in-progress');
      expect(inProgressColumn?.statuses).toEqual(originalInProgressStatuses);
    });
  });

  describe('resetColumns', () => {
    it('should reset columns to default configuration', () => {
      // Modify columns
      useBoardStore.getState().toggleColumnVisibility('todo');
      useBoardStore.getState().updateColumnStatuses('in-progress', ['Working']);

      const columns = useBoardStore.getState().columns;
      const todoColumn = columns.find((c) => c.id === 'todo');
      const inProgressColumn = columns.find((c) => c.id === 'in-progress');

      expect(todoColumn?.visible).toBe(false);
      expect(inProgressColumn?.statuses).toEqual(['Working']);

      // Reset
      useBoardStore.getState().resetColumns();

      // Verify reset
      const resetColumns = useBoardStore.getState().columns;
      const resetTodo = resetColumns.find((c) => c.id === 'todo');
      const resetInProgress = resetColumns.find((c) => c.id === 'in-progress');

      expect(resetTodo?.visible).toBe(true);
      expect(resetTodo?.statuses).toEqual(['To Do', 'Open', 'Backlog', 'New']);
      expect(resetInProgress?.statuses).toEqual([
        'In Progress',
        'In Review',
        'In Development',
        'Testing',
      ]);
    });

    it('should restore all three default columns', () => {
      // Remove all columns
      useBoardStore.getState().setColumns([]);

      expect(useBoardStore.getState().columns).toHaveLength(0);

      // Reset
      useBoardStore.getState().resetColumns();

      expect(useBoardStore.getState().columns).toHaveLength(3);
      expect(useBoardStore.getState().columns.map((c) => c.id)).toEqual([
        'todo',
        'in-progress',
        'done',
      ]);
    });
  });
});
