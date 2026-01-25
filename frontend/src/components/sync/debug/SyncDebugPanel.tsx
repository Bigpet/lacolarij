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

interface SyncDebugPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string | null;
}

type Tab = 'logs' | 'pending';

export function SyncDebugPanel({
  open,
  onOpenChange,
  connectionId,
}: SyncDebugPanelProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>('logs');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sync Debugging</DialogTitle>
          <DialogDescription>
            View sync logs and manage pending operations
          </DialogDescription>
        </DialogHeader>

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

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'logs' ? (
            <SyncLogViewer />
          ) : (
            <PendingOperationsList connectionId={connectionId} />
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
