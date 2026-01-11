/**
 * Hook for full-text search across issues.
 *
 * Automatically indexes issues and provides search results.
 */

import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { searchService } from '@/features/search/searchService';
import { extractTextFromAdf } from '@/lib/adf';
import type { Issue } from '@/types';

/**
 * Extract searchable text from a description (handles both ADF and plain text).
 */
function getDescriptionText(description: Issue['description']): string {
  if (typeof description === 'string') {
    return description;
  } else if (description) {
    return extractTextFromAdf(description);
  }
  return '';
}

/**
 * Check if all query words match as prefixes of words in the target text.
 * E.g., "perf test" matches "Performance Testing" because "perf" is prefix of "Performance"
 * and "test" is prefix of "Testing".
 */
function matchesAllWords(query: string, target: string): boolean {
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const targetWords = target.toLowerCase().split(/\s+/).filter(Boolean);

  // Every query word must match as a prefix of at least one target word
  return queryWords.every((qWord) =>
    targetWords.some((tWord) => tWord.startsWith(qWord))
  );
}

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
    () => db.issues.orderBy('_localUpdated').reverse().toArray(),
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

    const query = searchQuery.trim();

    // First pass: find exact matches using word-prefix matching
    // Each query word must match as a prefix of a word in key, summary, or description
    const exactMatches = allIssues.filter(
      (issue) =>
        matchesAllWords(query, issue.key) ||
        matchesAllWords(query, issue.summary) ||
        matchesAllWords(query, getDescriptionText(issue.description))
    );

    // If we have exact matches, return only those (precise search)
    if (exactMatches.length > 0) {
      return exactMatches;
    }

    // No exact matches - fall back to fuzzy/prefix matches from MiniSearch
    // This helps with typos like "authntication" -> "authentication"
    if (!isIndexReady) {
      return [];
    }

    const fuzzyMatchIds = searchService.search(searchQuery);
    const issueMap = new Map(allIssues.map((i) => [i.id, i]));
    return fuzzyMatchIds
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
