import { useState, useMemo, useCallback, useEffect } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { api } from "@/lib/api";
import { issueService } from "@/features/issues/issueService";
import { useSyncStore } from "@/stores/syncStore";
import { useBoardStore } from "@/stores/boardStore";
import { useAuthStore } from "@/stores/authStore";
import { useSearch } from "@/hooks/useSearch";
import { BoardColumn } from "@/components/board/BoardColumn";
import { QuickFilters, defaultQuickFilters } from "@/components/board/QuickFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RefreshCw,
  Settings2,
  Search,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import type { Issue } from "@/types";

export function BoardPage() {
  const { activeConnectionId } = useSyncStore();
  const { user } = useAuthStore();
  const {
    activeFilters,
    toggleFilter,
    clearFilters,
    columns,
    toggleColumnVisibility,
    resetColumns,
    searchTerm,
    setSearchTerm,
  } = useBoardStore();

  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [transitionsCache, setTransitionsCache] = useState<
    Record<string, { id: string; name: string; toStatus: string; toCategory: string }[]>
  >({});

  // Full-text search with MiniSearch
  const { results: searchResults, totalCount } = useSearch(searchTerm);

  // Fetch transitions for issues (cache them)
  const fetchTransitions = useCallback(
    async (issueId: string, issueKey: string) => {
      if (!activeConnectionId || transitionsCache[issueId]) return;

      try {
        const response = await api.getTransitions(activeConnectionId, issueKey);
        const mapped = response.transitions.map((t) => ({
          id: t.id,
          name: t.name,
          toStatus: t.to.name,
          toCategory: t.to.statusCategory.key as string,
        }));
        setTransitionsCache((prev) => ({ ...prev, [issueId]: mapped }));
      } catch (error) {
        console.error("Failed to fetch transitions:", error);
      }
    },
    [activeConnectionId, transitionsCache]
  );

  // Prefetch transitions for visible issues
  useEffect(() => {
    if (!searchResults.length || !activeConnectionId) return;

    // Only prefetch for first 20 issues to avoid rate limiting
    const issuesToPrefetch = searchResults.slice(0, 20);
    issuesToPrefetch.forEach((issue) => {
      if (!transitionsCache[issue.id]) {
        fetchTransitions(issue.id, issue.key);
      }
    });
  }, [searchResults, activeConnectionId, fetchTransitions, transitionsCache]);

  // Apply quick filters on top of search results
  const filteredIssues = useMemo(() => {
    let result = searchResults;

    // Apply quick filters
    if (activeFilters.length > 0) {
      result = result.filter((issue) => {
        return activeFilters.every((filterId) => {
          const filterDef = defaultQuickFilters.find((f) => f.id === filterId);
          if (!filterDef) return true;

          // Special handling for "my-issues" filter
          if (filterId === "my-issues" && user?.username) {
            return issue.assignee
              ?.toLowerCase()
              .includes(user.username.toLowerCase());
          }

          return filterDef.filter(issue);
        });
      });
    }

    return result;
  }, [searchResults, activeFilters, user]);

  // Group issues by column
  const issuesByColumn = useMemo(() => {
    const grouped: Record<string, Issue[]> = {};

    columns.forEach((col) => {
      grouped[col.id] = [];
    });

    filteredIssues.forEach((issue) => {
      // Find matching column by status category first, then by status name
      const matchingColumn = columns.find(
        (col) =>
          col.statusCategory === issue.statusCategory ||
          col.statuses.some(
            (s) => s.toLowerCase() === issue.status.toLowerCase()
          )
      );

      if (matchingColumn) {
        grouped[matchingColumn.id].push(issue);
      } else {
        // Default to first column if no match
        const firstCol = columns[0];
        if (firstCol) {
          grouped[firstCol.id].push(issue);
        }
      }
    });

    return grouped;
  }, [filteredIssues, columns]);

  // Map JIRA status category keys to our internal category names
  const mapJiraCategoryToInternal = (
    jiraCategory: string
  ): "todo" | "indeterminate" | "done" => {
    const key = jiraCategory.toLowerCase();
    if (key === "new" || key === "todo") return "todo";
    if (key === "done") return "done";
    return "indeterminate";
  };

  // Handle drag end
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;

      // Dropped outside a valid area or same position
      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      // Find the issue and target column
      const issue = filteredIssues.find((i) => i.id === draggableId);
      const targetColumn = columns.find((c) => c.id === destination.droppableId);

      if (!issue || !targetColumn) {
        console.warn("Issue or target column not found");
        return;
      }

      // If moving to a different column, find an appropriate transition
      if (destination.droppableId !== source.droppableId) {
        const issueTransitions = transitionsCache[issue.id];

        if (!issueTransitions || issueTransitions.length === 0) {
          // If no connection or no cached transitions, just update locally
          // The sync will handle the actual transition later
          console.log("No transitions cached, updating locally only");
          await issueService.transitionIssue(
            issue.id,
            "local-only", // Placeholder transition ID
            {
              name: targetColumn.statuses[0] || targetColumn.title,
              category: targetColumn.statusCategory,
            }
          );
          return;
        }

        // Find a transition that matches the target column
        const matchingTransition = issueTransitions.find((t) => {
          const mappedCategory = mapJiraCategoryToInternal(t.toCategory);
          // Match by status category
          if (mappedCategory === targetColumn.statusCategory) return true;
          // Match by status name
          return targetColumn.statuses.some(
            (s) => s.toLowerCase() === t.toStatus.toLowerCase()
          );
        });

        if (matchingTransition) {
          // Perform the transition
          console.log("Transitioning issue", issue.key, "to", matchingTransition.toStatus);
          await issueService.transitionIssue(issue.id, matchingTransition.id, {
            name: matchingTransition.toStatus,
            category: mapJiraCategoryToInternal(matchingTransition.toCategory),
          });
        } else {
          // No matching transition found - try the first available one for that category
          const fallbackTransition = issueTransitions.find((t) => {
            const mappedCategory = mapJiraCategoryToInternal(t.toCategory);
            return mappedCategory === targetColumn.statusCategory;
          });

          if (fallbackTransition) {
            console.log("Using fallback transition to", fallbackTransition.toStatus);
            await issueService.transitionIssue(issue.id, fallbackTransition.id, {
              name: fallbackTransition.toStatus,
              category: mapJiraCategoryToInternal(fallbackTransition.toCategory),
            });
          } else {
            console.warn(
              "No matching transition found for target column:",
              targetColumn.title,
              "Available transitions:",
              issueTransitions
            );
          }
        }
      }
    },
    [filteredIssues, columns, transitionsCache]
  );

  const visibleColumns = columns.filter((col) => col.visible);

  return (
    <div className="flex flex-col h-full" data-testid="board-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" data-testid="board-heading">Board</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumnSettings(!showColumnSettings)}
          >
            <Settings2 className="h-4 w-4 mr-1" />
            Columns
          </Button>
        </div>
      </div>

      {/* Column Settings Panel */}
      {showColumnSettings && (
        <div className="mb-4 p-4 border rounded-lg bg-muted/30" data-testid="column-settings-panel">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Column Visibility</h3>
            <Button variant="ghost" size="sm" onClick={resetColumns}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {columns.map((col) => (
              <Button
                key={col.id}
                variant={col.visible ? "default" : "outline"}
                size="sm"
                onClick={() => toggleColumnVisibility(col.id)}
                className="gap-1"
              >
                {col.visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
                {col.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
            data-testid="board-search"
          />
        </div>
        <QuickFilters
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
          onClearFilters={clearFilters}
          currentUser={user?.username}
        />
      </div>

      {/* Board Columns - single scroll container */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 pb-4 overflow-x-auto" data-testid="board-columns">
          {visibleColumns.map((column) => (
            <BoardColumn
              key={column.id}
              id={column.id}
              title={column.title}
              issues={issuesByColumn[column.id] || []}
              colorClass={column.colorClass}
              statusCategory={column.statusCategory}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Empty State */}
      {totalCount === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="board-empty-state">
          <RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">No issues found</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Sync with JIRA to load issues, or adjust your filters if you have
            issues locally.
          </p>
        </div>
      )}
    </div>
  );
}
