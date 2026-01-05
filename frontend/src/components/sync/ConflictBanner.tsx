/**
 * Conflict banner - shows when there are unresolved conflicts.
 */

import { useSyncStore } from "@/stores/syncStore";
import { AlertTriangle, ChevronRight } from "lucide-react";

interface ConflictBannerProps {
  onReviewClick: () => void;
}

export function ConflictBanner({ onReviewClick }: ConflictBannerProps) {
  const conflicts = useSyncStore((state) => state.conflicts);

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div
      className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-2 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
      onClick={onReviewClick}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {conflicts.length === 1
              ? "1 issue has a conflict that needs resolution"
              : `${conflicts.length} issues have conflicts that need resolution`}
          </span>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100">
          Review Now
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
