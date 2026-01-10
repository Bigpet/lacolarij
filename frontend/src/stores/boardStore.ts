/**
 * Zustand store for board state management.
 * Handles quick filters and column configuration.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BoardColumn {
  id: string;
  title: string;
  statusCategory: "todo" | "indeterminate" | "done";
  statuses: string[]; // Status names that map to this column
  colorClass: string;
  visible: boolean;
}

interface BoardState {
  // Quick filters
  activeFilters: string[];

  // Column configuration
  columns: BoardColumn[];

  // Search term for board
  searchTerm: string;

  // Actions
  toggleFilter: (filterId: string) => void;
  clearFilters: () => void;
  setSearchTerm: (term: string) => void;
  setColumns: (columns: BoardColumn[]) => void;
  toggleColumnVisibility: (columnId: string) => void;
  updateColumnStatuses: (columnId: string, statuses: string[]) => void;
  resetColumns: () => void;
}

// Default column configuration based on JIRA status categories
const defaultColumns: BoardColumn[] = [
  {
    id: "todo",
    title: "To Do",
    statusCategory: "todo",
    statuses: ["To Do", "Open", "Backlog", "New"],
    colorClass: "bg-slate-100 dark:bg-slate-800",
    visible: true,
  },
  {
    id: "in-progress",
    title: "In Progress",
    statusCategory: "indeterminate",
    statuses: ["In Progress", "In Review", "In Development", "Testing"],
    colorClass: "bg-blue-50 dark:bg-blue-950",
    visible: true,
  },
  {
    id: "done",
    title: "Done",
    statusCategory: "done",
    statuses: ["Done", "Closed", "Resolved", "Complete"],
    colorClass: "bg-green-50 dark:bg-green-950",
    visible: true,
  },
];

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      activeFilters: [],
      columns: defaultColumns,
      searchTerm: "",

      toggleFilter: (filterId) =>
        set((state) => ({
          activeFilters: state.activeFilters.includes(filterId)
            ? state.activeFilters.filter((id) => id !== filterId)
            : [...state.activeFilters, filterId],
        })),

      clearFilters: () => set({ activeFilters: [], searchTerm: "" }),

      setSearchTerm: (searchTerm) => set({ searchTerm }),

      setColumns: (columns) => set({ columns }),

      toggleColumnVisibility: (columnId) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === columnId ? { ...col, visible: !col.visible } : col
          ),
        })),

      updateColumnStatuses: (columnId, statuses) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === columnId ? { ...col, statuses } : col
          ),
        })),

      resetColumns: () => set({ columns: defaultColumns }),
    }),
    {
      name: "jiralocal-board",
      partialize: (state) => ({
        columns: state.columns,
        activeFilters: state.activeFilters,
        // Don't persist searchTerm
      }),
    }
  )
);
