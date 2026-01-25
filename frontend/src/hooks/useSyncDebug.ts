/**
 * Hook for sync debugging functionality.
 */

import { useSyncDebugStore } from '@/stores/syncDebugStore';
import { useSyncStore } from '@/stores/syncStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  syncSingleOperation,
  deletePendingOperation,
} from '@/features/sync/syncDebugService';
import type { PendingOperation } from '@/types';

export function useSyncDebug() {
  // Debug store state
  const { logs, isCapturing, clearLogs, setCapturing } = useSyncDebugStore();

  // Sync store state for connection
  const { activeConnectionId } = useSyncStore();

  // Live query for pending operations
  const pendingOperations = useLiveQuery(
    () => db.pendingOperations.orderBy('createdAt').toArray(),
    []
  );

  // Sync a single operation
  const syncOperation = async (operationId: string) => {
    if (!activeConnectionId) {
      throw new Error('No active connection');
    }
    return syncSingleOperation(activeConnectionId, operationId);
  };

  // Delete a pending operation
  const deleteOperation = async (operationId: string) => {
    return deletePendingOperation(operationId);
  };

  return {
    // Log state
    logs,
    isCapturing,
    clearLogs,
    setCapturing,

    // Pending operations
    pendingOperations: pendingOperations ?? ([] as PendingOperation[]),
    pendingCount: pendingOperations?.length ?? 0,

    // Connection
    activeConnectionId,

    // Actions
    syncOperation,
    deleteOperation,
  };
}
