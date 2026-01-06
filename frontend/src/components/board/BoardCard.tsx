import { cn } from "@/lib/utils";
import type { Issue } from "@/types";
import { AlertCircle, CheckCircle, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BoardCardProps {
  issue: Issue;
  isDragging?: boolean;
}

function getSyncStatusIcon(status: Issue["_syncStatus"]) {
  switch (status) {
    case "synced":
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case "pending":
      return <Clock className="h-3 w-3 text-yellow-500" />;
    case "conflict":
      return <AlertCircle className="h-3 w-3 text-red-500" />;
  }
}

function getIssueTypeEmoji(type: string): string {
  const typeLower = type.toLowerCase();
  if (typeLower.includes("bug")) return "🐛";
  if (typeLower.includes("story")) return "📖";
  if (typeLower.includes("epic")) return "⚡";
  if (typeLower.includes("subtask") || typeLower.includes("sub-task"))
    return "📌";
  return "📋";
}

function getPriorityColor(priority: string): string {
  const priorityLower = priority.toLowerCase();
  if (priorityLower.includes("highest") || priorityLower.includes("blocker"))
    return "text-red-600";
  if (priorityLower.includes("high")) return "text-orange-500";
  if (priorityLower.includes("medium")) return "text-yellow-500";
  if (priorityLower.includes("low")) return "text-blue-500";
  if (priorityLower.includes("lowest")) return "text-gray-400";
  return "text-muted-foreground";
}

export function BoardCard({ issue, isDragging }: BoardCardProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if we're dragging
    if (isDragging) {
      e.preventDefault();
      return;
    }
    navigate(`/issues/${issue.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "bg-card border rounded-lg p-3 cursor-pointer transition-all",
        "hover:shadow-md hover:border-primary/50",
        isDragging && "shadow-lg rotate-2 opacity-90"
      )}
    >
      {/* Header: Key + Sync Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{getIssueTypeEmoji(issue.issueType)}</span>
          <span className="font-mono text-xs font-medium text-primary">
            {issue.key}
          </span>
        </div>
        {getSyncStatusIcon(issue._syncStatus)}
      </div>

      {/* Summary */}
      <p className="text-sm line-clamp-2 mb-3">{issue.summary}</p>

      {/* Footer: Priority + Assignee */}
      <div className="flex items-center justify-between text-xs">
        {issue.priority && (
          <span className={cn("font-medium", getPriorityColor(issue.priority))}>
            {issue.priority}
          </span>
        )}
        {!issue.priority && <span />}

        <div className="flex items-center gap-1">
          {issue.assignee ? (
            <>
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground truncate max-w-[80px]">
                {issue.assignee}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground italic">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
}
