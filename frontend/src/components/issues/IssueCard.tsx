import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Issue } from '@/types';
import { AlertCircle, CheckCircle, Clock, User } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  selected?: boolean;
}

function getStatusCategoryVariant(
  category: 'todo' | 'indeterminate' | 'done'
): 'info' | 'warning' | 'success' {
  switch (category) {
    case 'todo':
      return 'info';
    case 'indeterminate':
      return 'warning';
    case 'done':
      return 'success';
  }
}

function getSyncStatusIcon(status: Issue['_syncStatus']) {
  switch (status) {
    case 'synced':
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case 'pending':
      return <Clock className="h-3 w-3 text-yellow-500" />;
    case 'conflict':
      return <AlertCircle className="h-3 w-3 text-red-500" />;
  }
}

function getIssueTypeEmoji(type: string): string {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('bug')) return '🐛';
  if (typeLower.includes('story')) return '📖';
  if (typeLower.includes('epic')) return '⚡';
  if (typeLower.includes('subtask') || typeLower.includes('sub-task'))
    return '📌';
  return '📋';
}

export function IssueCard({ issue, onClick, selected }: IssueCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-colors',
        'hover:bg-muted/50',
        selected && 'bg-accent border-primary'
      )}
      data-testid="issue-card"
      data-issue-key={issue.key}
      data-sync-status={issue._syncStatus}
    >
      {/* Issue key and sync status */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <span className="text-xs text-muted-foreground">
          {getIssueTypeEmoji(issue.issueType)}
        </span>
        <span className="font-mono text-sm font-medium text-primary">
          {issue.key}
        </span>
        {getSyncStatusIcon(issue._syncStatus)}
      </div>

      {/* Summary */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm">{issue.summary}</p>
      </div>

      {/* Status */}
      <Badge variant={getStatusCategoryVariant(issue.statusCategory)}>
        {issue.status}
      </Badge>

      {/* Priority (if set) */}
      {issue.priority && (
        <span className="text-xs text-muted-foreground w-16 text-center">
          {issue.priority}
        </span>
      )}

      {/* Assignee */}
      <div className="flex items-center gap-1 min-w-[100px]">
        {issue.assignee ? (
          <>
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {issue.assignee}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Unassigned
          </span>
        )}
      </div>
    </div>
  );
}
