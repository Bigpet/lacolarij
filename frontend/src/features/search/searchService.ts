/**
 * Full-text search service using MiniSearch.
 *
 * Provides fast, fuzzy search across issue fields including:
 * key, summary, description, labels, assignee, and reporter.
 */

import MiniSearch from "minisearch";
import type { Issue } from "@/types";
import { extractTextFromAdf } from "@/lib/adf";

interface SearchableIssue {
  id: string;
  key: string;
  summary: string;
  descriptionText: string;
  labels: string;
  assignee: string;
  reporter: string;
}

class SearchService {
  private miniSearch: MiniSearch<SearchableIssue>;
  private indexedIds: Set<string> = new Set();

  constructor() {
    this.miniSearch = new MiniSearch({
      fields: [
        "key",
        "summary",
        "descriptionText",
        "labels",
        "assignee",
        "reporter",
      ],
      storeFields: ["id"],
      searchOptions: {
        // Use term-wise prefix matching (only prefix within a single term)
        // 'word' mode would match 'test' in 'test case' but not 'test' in 'latest'
        // We disable prefix for now to get exact matches, which is what the tests expect
        prefix: false,
        fuzzy: false, //0.2,
        boost: { key: 3, summary: 2, labels: 1.5 },
      },
    });
  }

  /**
   * Convert an Issue to a searchable document.
   */
  private toSearchable(issue: Issue): SearchableIssue {
    // Handle description - could be ADF object, plain string, or null
    let descriptionText = "";
    if (typeof issue.description === "string") {
      descriptionText = issue.description;
    } else if (issue.description) {
      descriptionText = extractTextFromAdf(issue.description);
    }

    return {
      id: issue.id,
      key: issue.key,
      summary: issue.summary,
      descriptionText,
      labels: issue.labels.join(" "),
      assignee: issue.assignee || "",
      reporter: issue.reporter || "",
    };
  }

  /**
   * Index or update a single issue.
   */
  indexIssue(issue: Issue): void {
    const searchable = this.toSearchable(issue);

    if (this.indexedIds.has(issue.id)) {
      // MiniSearch doesn't have a direct update, so we discard and re-add
      this.miniSearch.discard(issue.id);
    }

    this.miniSearch.add(searchable);
    this.indexedIds.add(issue.id);
  }

  /**
   * Remove an issue from the index.
   */
  removeIssue(id: string): void {
    if (this.indexedIds.has(id)) {
      this.miniSearch.discard(id);
      this.indexedIds.delete(id);
    }
  }

  /**
   * Search for issues matching the query.
   * Returns an array of issue IDs sorted by relevance.
   */
  search(query: string): string[] {
    if (!query.trim()) return [];

    // Check if this looks like an exact issue key search (e.g., "TEST-123", "PROJ-456")
    // Issue keys typically follow the pattern: LETTERS-NUMBERS
    const issueKeyPattern = /^[A-Z][A-Z0-9]*-\d+$/;
    const isExactKeySearch = issueKeyPattern.test(query.trim().toUpperCase());

    if (isExactKeySearch) {
      // For exact key searches, do exact matching (no prefix, no fuzzy)
      const results = this.miniSearch.search(query, {
        prefix: false,
        fuzzy: false,
      });
      return results.map((r) => r.id);
    }

    // For other searches, use prefix and fuzzy matching for better UX
    const results = this.miniSearch.search(query, {
      prefix: true,
      fuzzy: 0.2,
    });
    return results.map((r) => r.id);
  }

  /**
   * Rebuild the entire index from a list of issues.
   */
  reindexAll(issues: Issue[]): void {
    this.miniSearch.removeAll();
    this.indexedIds.clear();

    const searchables = issues.map((issue) => this.toSearchable(issue));
    this.miniSearch.addAll(searchables);

    issues.forEach((issue) => this.indexedIds.add(issue.id));
  }

  /**
   * Get the number of indexed documents.
   */
  get documentCount(): number {
    return this.indexedIds.size;
  }

  /**
   * Clear the index.
   */
  clear(): void {
    this.miniSearch.removeAll();
    this.indexedIds.clear();
  }
}

// Singleton instance
export const searchService = new SearchService();
