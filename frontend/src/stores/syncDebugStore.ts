/**
 * Zustand store for sync debug logging.
 */

import { create } from 'zustand';
import type { SyncLogEntry } from '@/types';

const MAX_LOG_ENTRIES = 500;

interface SyncDebugState {
  logs: SyncLogEntry[];
  isCapturing: boolean;

  // Actions
  addLog: (entry: Omit<SyncLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  setCapturing: (capturing: boolean) => void;
}

export const useSyncDebugStore = create<SyncDebugState>((set) => ({
  logs: [],
  isCapturing: true,

  addLog: (entry) => {
    set((state) => {
      if (!state.isCapturing) {
        return state;
      }

      const newEntry: SyncLogEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        timestamp: Date.now(),
      };

      // Ring buffer: keep only the last MAX_LOG_ENTRIES
      const newLogs = [...state.logs, newEntry];
      if (newLogs.length > MAX_LOG_ENTRIES) {
        newLogs.splice(0, newLogs.length - MAX_LOG_ENTRIES);
      }

      return { logs: newLogs };
    });
  },

  clearLogs: () => set({ logs: [] }),

  setCapturing: (isCapturing) => set({ isCapturing }),
}));

// Expose store to window for E2E testing and debugging
if (typeof window !== 'undefined') {
  (
    window as unknown as {
      __ZUSTAND_SYNC_DEBUG_STORE__: typeof useSyncDebugStore;
    }
  ).__ZUSTAND_SYNC_DEBUG_STORE__ = useSyncDebugStore;
}
