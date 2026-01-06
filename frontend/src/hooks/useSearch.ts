/**
 * Hook for full-text search across issues.
 *
 * Automatically indexes issues and provides search results.
 */

import { useState, useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { searchService } from "@/features/search/searchService";
import type { Issue } from "@/types";

interface UseSearchResult {
  /** Search results (filtered issues) or all issues if no query */
  results: Issue[];
  /** Whether a search is active (query is not empty) */
  isSearching: boolean;
  /** Whether the search index is ready */
  isIndexReady: boolean;
  /** Total number of issues in the index */
  totalCount: number;
}

export function useSearch(searchQuery: string): UseSearchResult {
  const [isIndexReady, setIsIndexReady] = useState(false);

  // Get all issues for indexing (live query updates when issues change)
  const allIssues = useLiveQuery(
    () => db.issues.orderBy("_localUpdated").reverse().toArray(),
    []
  );

  // Rebuild index when issues change
  useEffect(() => {
    if (allIssues) {
      searchService.reindexAll(allIssues);
      setIsIndexReady(true);
    }
  }, [allIssues]);

  // Compute search results
  const results = useMemo(() => {
    if (!allIssues) return [];

    // If no search query, return all issues
    if (!searchQuery.trim()) {
      return allIssues;
    }

    // If index not ready, fall back to simple filter
    if (!isIndexReady) {
      const query = searchQuery.toLowerCase();
      return allIssues.filter(
        (issue) =>
          issue.key.toLowerCase().includes(query) ||
          issue.summary.toLowerCase().includes(query)
      );
    }

    // Use MiniSearch for full-text search
    const matchingIds = searchService.search(searchQuery);
    const issueMap = new Map(allIssues.map((i) => [i.id, i]));

    return matchingIds
      .map((id) => issueMap.get(id))
      .filter((i): i is Issue => i !== undefined);
  }, [searchQuery, isIndexReady, allIssues]);

  return {
    results,
    isSearching: !!searchQuery.trim(),
    isIndexReady,
    totalCount: allIssues?.length ?? 0,
  };
}
