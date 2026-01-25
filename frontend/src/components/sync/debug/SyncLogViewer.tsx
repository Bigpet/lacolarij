/**
 * Sync Log Viewer - Displays sync debug log entries.
 */

import * as React from 'react';
import { useSyncDebugStore } from '@/stores/syncDebugStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Trash2,
  Copy,
  Pause,
  Play,
} from 'lucide-react';
import type { SyncLogEntry } from '@/types';

type LevelFilter = 'all' | 'info' | 'warn' | 'error' | 'success';
type OperationFilter = 'all' | 'push' | 'pull' | 'conflict' | 'isolated-sync';

function getLevelIcon(level: SyncLogEntry['level']) {
  switch (level) {
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'warn':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
}

function getLevelColor(level: SyncLogEntry['level']) {
  switch (level) {
    case 'info':
      return 'text-blue-600';
    case 'warn':
      return 'text-yellow-600';
    case 'error':
      return 'text-red-600';
    case 'success':
      return 'text-green-600';
  }
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

interface LogEntryRowProps {
  entry: SyncLogEntry;
}

function LogEntryRow({ entry }: LogEntryRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hasDetails = entry.details !== undefined;

  return (
    <div className="border-b last:border-b-0">
      <div
        className={cn(
          'flex items-start gap-2 px-3 py-2 hover:bg-muted/50',
          hasDetails && 'cursor-pointer'
        )}
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        {/* Expand icon */}
        <div className="w-4 flex-shrink-0 pt-0.5">
          {hasDetails ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : null}
        </div>

        {/* Level icon */}
        <div className="flex-shrink-0 pt-0.5">{getLevelIcon(entry.level)}</div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground font-mono flex-shrink-0 w-24">
          {formatTimestamp(entry.timestamp)}
        </span>

        {/* Operation badge */}
        <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono flex-shrink-0">
          {entry.operation}
        </span>

        {/* Entity key */}
        {entry.entityKey && (
          <span className="text-xs font-medium text-primary flex-shrink-0">
            {entry.entityKey}
          </span>
        )}

        {/* Message */}
        <span className={cn('text-sm flex-1', getLevelColor(entry.level))}>
          {entry.message}
        </span>
      </div>

      {/* Expanded details */}
      {expanded && hasDetails && (
        <div className="px-3 pb-3 pl-14">
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40 font-mono">
            {JSON.stringify(entry.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function SyncLogViewer() {
  const { logs, isCapturing, clearLogs, setCapturing } = useSyncDebugStore();
  const [levelFilter, setLevelFilter] = React.useState<LevelFilter>('all');
  const [operationFilter, setOperationFilter] =
    React.useState<OperationFilter>('all');
  const [autoScroll, setAutoScroll] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive
  React.useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filter logs
  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      if (levelFilter !== 'all' && log.level !== levelFilter) return false;
      if (operationFilter !== 'all' && log.operation !== operationFilter)
        return false;
      return true;
    });
  }, [logs, levelFilter, operationFilter]);

  const handleCopyAll = () => {
    const text = filteredLogs
      .map(
        (log) =>
          `[${formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] [${log.operation}] ${log.entityKey ? `[${log.entityKey}] ` : ''}${log.message}${log.details ? `\n  ${JSON.stringify(log.details)}` : ''}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
        {/* Level filter */}
        <select
          className="text-xs border rounded px-2 py-1 bg-background"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
        >
          <option value="all">All Levels</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
          <option value="success">Success</option>
        </select>

        {/* Operation filter */}
        <select
          className="text-xs border rounded px-2 py-1 bg-background"
          value={operationFilter}
          onChange={(e) =>
            setOperationFilter(e.target.value as OperationFilter)
          }
        >
          <option value="all">All Operations</option>
          <option value="push">Push</option>
          <option value="pull">Pull</option>
          <option value="conflict">Conflict</option>
          <option value="isolated-sync">Isolated Sync</option>
        </select>

        {/* Auto-scroll toggle */}
        <label className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded"
          />
          Auto-scroll
        </label>

        <div className="flex-1" />

        {/* Capture toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCapturing(!isCapturing)}
          title={isCapturing ? 'Pause capture' : 'Resume capture'}
        >
          {isCapturing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Copy all */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyAll}
          title="Copy all logs"
          disabled={filteredLogs.length === 0}
        >
          <Copy className="h-4 w-4" />
        </Button>

        {/* Clear logs */}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearLogs}
          title="Clear logs"
          disabled={logs.length === 0}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Log entries */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {logs.length === 0
              ? 'No log entries yet. Trigger a sync to see events.'
              : 'No entries match the current filters.'}
          </div>
        ) : (
          <div className="divide-y">
            {filteredLogs.map((entry) => (
              <LogEntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t text-xs text-muted-foreground bg-muted/30">
        <span>
          {filteredLogs.length} / {logs.length} entries
        </span>
        <span>{isCapturing ? 'Capturing' : 'Paused'}</span>
      </div>
    </div>
  );
}
