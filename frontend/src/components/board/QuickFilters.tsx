import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, Clock, AlertTriangle, Filter, X } from "lucide-react";

export interface QuickFilter {
  id: string;
  label: string;
  icon?: React.ReactNode;
  filter: (issue: { assignee: string | null; priority: string; _localUpdated: number }) => boolean;
}

interface QuickFiltersProps {
  activeFilters: string[];
  onToggleFilter: (filterId: string) => void;
  onClearFilters: () => void;
  currentUser?: string;
}

export const defaultQuickFilters: QuickFilter[] = [
  {
    id: "my-issues",
    label: "My Issues",
    icon: <User className="h-3 w-3" />,
    filter: () => true, // Will be overridden with actual user
  },
  {
    id: "recently-updated",
    label: "Recently Updated",
    icon: <Clock className="h-3 w-3" />,
    filter: (issue) => {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return issue._localUpdated > oneDayAgo;
    },
  },
  {
    id: "high-priority",
    label: "High Priority",
    icon: <AlertTriangle className="h-3 w-3" />,
    filter: (issue) => {
      const priority = issue.priority.toLowerCase();
      return (
        priority.includes("highest") ||
        priority.includes("high") ||
        priority.includes("blocker") ||
        priority.includes("critical")
      );
    },
  },
];

export function QuickFilters({
  activeFilters,
  onToggleFilter,
  onClearFilters,
  currentUser,
}: QuickFiltersProps) {
  // Create filters with currentUser context
  const filters = defaultQuickFilters.map((f) => {
    if (f.id === "my-issues" && currentUser) {
      return {
        ...f,
        filter: (issue: { assignee: string | null }) =>
          issue.assignee?.toLowerCase().includes(currentUser.toLowerCase()) ??
          false,
      };
    }
    return f;
  });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Quick Filters:</span>
      </div>

      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeFilters.includes(filter.id) ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleFilter(filter.id)}
          className={cn(
            "h-7 text-xs gap-1",
            activeFilters.includes(filter.id) && "bg-primary text-primary-foreground"
          )}
        >
          {filter.icon}
          {filter.label}
        </Button>
      ))}

      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-7 text-xs gap-1 text-muted-foreground"
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
