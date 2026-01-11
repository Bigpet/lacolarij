/**
 * Zustand store for sync state management.
 */

import { create } from "zustand";

export interface Conflict {
  id: string;
  entityType: "issue" | "comment";
  entityId: string;
  entityKey?: string;
  field?: string;
  localValue: unknown;
  remoteValue: unknown;
  localTimestamp: number;
  remoteTimestamp: string;
  connectionId: string;
}

interface SyncState {
  status: "idle" | "syncing" | "error";
  lastSync: Date | null;
  pendingCount: number;
  conflicts: Conflict[];
  error: string | null;
  activeConnectionId: string | null;
  isOnline: boolean;

  // Actions
  setStatus: (status: "idle" | "syncing" | "error") => void;
  setLastSync: (date: Date) => void;
  setPendingCount: (count: number) => void;
  addConflict: (conflict: Conflict) => void;
  updateConflict: (id: string, updates: Partial<Omit<Conflict, "id">>) => void;
  removeConflict: (id: string) => void;
  clearConflicts: () => void;
  setError: (error: string | null) => void;
  setActiveConnection: (connectionId: string | null) => void;
  setOnline: (online: boolean) => void;
  reset: () => void;
}

const initialState = {
  status: "idle" as const,
  lastSync: null,
  pendingCount: 0,
  conflicts: [],
  error: null,
  activeConnectionId: null,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
};

export const useSyncStore = create<SyncState>((set, get) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setLastSync: (lastSync) => set({ lastSync }),
  setPendingCount: (pendingCount) => set({ pendingCount }),

  addConflict: (conflict) => {
    console.log('[syncStore] addConflict:', conflict.id);
    set((state) => ({
      conflicts: [...state.conflicts, conflict],
    }));
  },

  updateConflict: (id, updates) =>
    set((state) => ({
      conflicts: state.conflicts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  removeConflict: (id) => {
    const currentConflicts = get().conflicts;
    console.log('[syncStore] removeConflict called with id:', id);
    console.log('[syncStore] current conflicts:', currentConflicts.map(c => c.id));
    set((state) => {
      const newConflicts = state.conflicts.filter((c) => c.id !== id);
      console.log('[syncStore] new conflicts after filter:', newConflicts.map(c => c.id));
      return { conflicts: newConflicts };
    });
  },

  clearConflicts: () => set({ conflicts: [] }),
  setError: (error) => set({ error }),
  setActiveConnection: (activeConnectionId) => set({ activeConnectionId }),
  setOnline: (isOnline) => set({ isOnline }),
  reset: () => set(initialState),
}));

// Expose store to window for E2E testing debug
if (typeof window !== 'undefined') {
  (window as unknown as { __ZUSTAND_SYNC_STORE__: typeof useSyncStore })
    .__ZUSTAND_SYNC_STORE__ = useSyncStore;
}
