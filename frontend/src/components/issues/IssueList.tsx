import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Issue } from "@/types";
import { IssueCard } from "./IssueCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";

interface IssueListProps {
  onIssueSelect?: (issue: Issue) => void;
  selectedIssueId?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function IssueList({
  onIssueSelect,
  selectedIssueId,
  onRefresh,
  isLoading,
}: IssueListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Load issues from IndexedDB
  const issues = useLiveQuery(
    () => db.issues.orderBy("_localUpdated").reverse().toArray(),
    []
  );

  // Get unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    if (!issues) return [];
    const statuses = new Set(issues.map((i) => i.status));
    return Array.from(statuses).sort();
  }, [issues]);

  // Filter issues
  const filteredIssues = useMemo(() => {
    if (!issues) return [];

    return issues.filter((issue) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          issue.key.toLowerCase().includes(query) ||
          issue.summary.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter && issue.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [issues, searchQuery, statusFilter]);

  // Count by status category
  const statusCounts = useMemo(() => {
    if (!issues) return { todo: 0, indeterminate: 0, done: 0 };
    return issues.reduce(
      (acc, issue) => {
        acc[issue.statusCategory]++;
        return acc;
      },
      { todo: 0, indeterminate: 0, done: 0 }
    );
  }, [issues]);

  if (!issues) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filter bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status filter dropdown */}
        <select
          value={statusFilter || ""}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {uniqueStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        )}
      </div>

      {/* Status summary */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>
          To Do: <strong>{statusCounts.todo}</strong>
        </span>
        <span>
          In Progress: <strong>{statusCounts.indeterminate}</strong>
        </span>
        <span>
          Done: <strong>{statusCounts.done}</strong>
        </span>
        <span className="ml-auto">
          Total: <strong>{issues.length}</strong>
        </span>
      </div>

      {/* Issue list */}
      {filteredIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          {issues.length === 0 ? (
            <>
              <p className="text-lg">No issues yet</p>
              <p className="text-sm">
                Configure a JIRA connection and sync to see issues here.
              </p>
            </>
          ) : (
            <p>No issues match your filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onIssueSelect?.(issue)}
              selected={issue.id === selectedIssueId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
