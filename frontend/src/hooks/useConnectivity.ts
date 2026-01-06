/**
 * Hook for monitoring network connectivity and auto-syncing on reconnection.
 */

import { useEffect, useCallback } from "react";
import { useSyncStore } from "@/stores/syncStore";
import { syncEngine } from "@/features/sync/syncEngine";

export function useConnectivity() {
  const { isOnline, setOnline, pendingCount, activeConnectionId } =
    useSyncStore();

  const handleOnline = useCallback(() => {
    setOnline(true);

    // Auto-sync if there are pending changes
    if (pendingCount > 0 && activeConnectionId) {
      console.log("Back online, syncing pending changes...");
      syncEngine.startSync({ connectionId: activeConnectionId });
    }
  }, [setOnline, pendingCount, activeConnectionId]);

  const handleOffline = useCallback(() => {
    setOnline(false);
    console.log("Gone offline");
  }, [setOnline]);

  useEffect(() => {
    // Set initial state
    setOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline, setOnline]);

  return { isOnline };
}
