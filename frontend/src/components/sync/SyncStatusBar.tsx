import { useSyncStore } from "@/stores/syncStore";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  CloudOff,
  Clock,
} from "lucide-react";

function formatRelativeTime(date: Date | null): string {
  if (!date) return "Never";

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function SyncStatusBar() {
  const { status, lastSync, pendingCount, conflicts, error, isOnline } = useSyncStore();

  return (
    <div className="flex items-center gap-3 text-sm" data-sync-status={status}>
      {/* Online/Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <CloudOff className="h-4 w-4" />
          <span>Offline</span>
        </div>
      )}

      {/* Sync status icon */}
      {status === "syncing" && (
        <div className="flex items-center gap-1 text-blue-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Syncing...</span>
        </div>
      )}
      {status === "idle" && isOnline && (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Synced</span>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span title={error || undefined}>Error</span>
        </div>
      )}

      {/* Pending count */}
      {pendingCount > 0 && (
        <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {pendingCount} pending
        </Badge>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {conflicts.length} {conflicts.length === 1 ? "conflict" : "conflicts"}
        </Badge>
      )}

      {/* Last sync time */}
      <span className="text-muted-foreground">
        Last sync: {formatRelativeTime(lastSync)}
      </span>
    </div>
  );
}
