/**
 * Sync Debug Panel - Main dialog for sync debugging tools.
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SyncLogViewer } from './SyncLogViewer';
import { PendingOperationsList } from './PendingOperationsList';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { JiraConnection } from '@/types';

interface SyncDebugPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string | null;
}

type Tab = 'logs' | 'pending';

export function SyncDebugPanel({
  open,
  onOpenChange,
  connectionId: initialConnectionId,
}: SyncDebugPanelProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>('logs');
  const [connections, setConnections] = React.useState<JiraConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = React.useState<
    string | null
  >(initialConnectionId);

  // Load connections when dialog opens
  React.useEffect(() => {
    if (open) {
      api.listConnections().then(setConnections).catch(console.error);
    }
  }, [open]);

  // Update selected connection when prop changes
  React.useEffect(() => {
    if (initialConnectionId) {
      setSelectedConnectionId(initialConnectionId);
    }
  }, [initialConnectionId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sync Debugging</DialogTitle>
          <DialogDescription>
            View sync logs and manage pending operations
          </DialogDescription>
        </DialogHeader>

        {/* Connection Selector */}
        <div className="flex items-center gap-2 px-1 py-2 border-b">
          <label className="text-sm font-medium">Connection:</label>
          <select
            className="flex-1 max-w-xs text-sm border rounded px-2 py-1.5 bg-background"
            value={selectedConnectionId || ''}
            onChange={(e) => setSelectedConnectionId(e.target.value || null)}
          >
            <option value="">Select a connection...</option>
            {connections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name} ({conn.jira_url})
              </option>
            ))}
          </select>
          {!selectedConnectionId && (
            <span className="text-xs text-yellow-600">
              Select a connection to enable sync actions
            </span>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'logs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('logs')}
          >
            Sync Log
          </button>
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'pending'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('pending')}
          >
            Pending Operations
          </button>
        </div>

        {/* Tab Content - fixed height with scroll */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'logs' ? (
            <SyncLogViewer />
          ) : (
            <PendingOperationsList connectionId={selectedConnectionId} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
