/**
 * Pending Operations List - Shows pending sync operations with sync/delete actions.
 */

import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, issueRepository } from '@/lib/db';
import {
  syncSingleOperation,
  deletePendingOperation,
} from '@/features/sync/syncDebugService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  Trash2,
  Play,
  Loader2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PendingOperation } from '@/types';

interface PendingOperationsListProps {
  connectionId: string | null;
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

interface OperationRowProps {
  operation: PendingOperation;
  connectionId: string | null;
  entityKey?: string;
}

function OperationRow({
  operation,
  connectionId,
  entityKey,
}: OperationRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const hasError = operation.lastError !== null;
  const hasPayload = operation.payload !== null;

  const handleSync = async () => {
    if (!connectionId) {
      setError('No connection selected');
      return;
    }

    setSyncing(true);
    setError(null);

    const result = await syncSingleOperation(connectionId, operation.id);

    setSyncing(false);

    if (!result.success) {
      setError(result.error || 'Sync failed');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    await deletePendingOperation(operation.id);
    setDeleting(false);
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  return (
    <div className="border rounded-md mb-2 overflow-hidden">
      {/* Header row */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 bg-muted/30',
          hasPayload && 'cursor-pointer'
        )}
        onClick={() => hasPayload && setExpanded(!expanded)}
      >
        {/* Expand icon */}
        <div className="w-4 flex-shrink-0">
          {hasPayload ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : null}
        </div>

        {/* Operation type */}
        <Badge variant="outline" className="flex-shrink-0">
          {operation.operation}
        </Badge>

        {/* Entity type */}
        <Badge variant="secondary" className="flex-shrink-0">
          {operation.entityType}
        </Badge>

        {/* Entity key */}
        <span className="font-mono text-sm font-medium text-primary">
          {entityKey || operation.entityId.slice(0, 12)}
        </span>

        {/* Attempts badge */}
        {operation.attempts > 0 && (
          <Badge variant="destructive" className="flex-shrink-0">
            {operation.attempts} attempt{operation.attempts > 1 ? 's' : ''}
          </Badge>
        )}

        {/* Created at */}
        <span className="text-xs text-muted-foreground ml-auto">
          {formatTimestamp(operation.createdAt)}
        </span>

        {/* Actions */}
        <div
          className="flex items-center gap-1 ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncing || !connectionId}
            title="Sync this operation now"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          {confirmDelete ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Confirm'
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelDelete}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              title="Delete this operation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Error display */}
      {(hasError || error) && (
        <div className="px-3 py-2 bg-destructive/10 text-destructive text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error || operation.lastError}</span>
        </div>
      )}

      {/* Expanded payload */}
      {expanded && hasPayload && (
        <div className="px-3 py-2 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Payload
          </p>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40 font-mono">
            {JSON.stringify(operation.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function PendingOperationsList({
  connectionId,
}: PendingOperationsListProps) {
  // Live query for pending operations
  const operations = useLiveQuery(
    () => db.pendingOperations.orderBy('createdAt').toArray(),
    []
  );

  // Get entity keys for display
  const [entityKeys, setEntityKeys] = React.useState<Record<string, string>>(
    {}
  );

  React.useEffect(() => {
    if (!operations) return;

    const fetchKeys = async () => {
      const keys: Record<string, string> = {};
      for (const op of operations) {
        if (op.entityType === 'issue') {
          const issue = await issueRepository.getById(op.entityId);
          if (issue) {
            keys[op.entityId] = issue.key;
          }
        }
      }
      setEntityKeys(keys);
    };

    fetchKeys();
  }, [operations]);

  const handleRefresh = () => {
    // LiveQuery handles this automatically, but we can force a re-render
    // by just letting the component re-fetch
  };

  if (!operations) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
        <span className="text-sm font-medium">
          {operations.length} pending operation{operations.length !== 1 && 's'}
        </span>

        <div className="flex-1" />

        {!connectionId && (
          <span className="text-xs text-yellow-600">
            No connection selected - sync actions disabled
          </span>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          title="Refresh list"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Operations list */}
      <div className="flex-1 overflow-auto p-3">
        {operations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No pending operations. All changes have been synced.
          </div>
        ) : (
          operations.map((op) => (
            <OperationRow
              key={op.id}
              operation={op}
              connectionId={connectionId}
              entityKey={entityKeys[op.entityId]}
            />
          ))
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t text-xs text-muted-foreground bg-muted/30">
        <span>
          {operations.filter((op) => op.attempts > 0).length} with errors
        </span>
        <span>Live updating</span>
      </div>
    </div>
  );
}
