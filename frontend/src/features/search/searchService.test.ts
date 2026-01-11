/**
 * Tests for searchService
 */

import { describe, it, expect, beforeEach } from "vitest";
import { searchService } from "./searchService";
import type { Issue } from "@/types";

describe("searchService", () => {
  const mockIssues: Issue[] = [
    {
      id: "issue-1",
      key: "TEST-1",
      projectKey: "TEST",
      summary: "Fix login bug",
      description: null,
      status: "Open",
      statusCategory: "todo",
      assignee: "alice",
      reporter: "bob",
      priority: "High",
      issueType: "Bug",
      labels: ["auth", "urgent"],
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T00:00:00Z",
      _localUpdated: Date.now(),
      _syncStatus: "synced",
      _syncError: null,
      _remoteVersion: "1",
    },
    {
      id: "issue-2",
      key: "TEST-2",
      projectKey: "TEST",
      summary: "Add search feature",
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Implement full-text search using MiniSearch",
              },
            ],
          },
        ],
      },
      status: "In Progress",
      statusCategory: "indeterminate",
      assignee: "charlie",
      reporter: "bob",
      priority: "Medium",
      issueType: "Story",
      labels: ["search"],
      created: "2024-01-02T00:00:00Z",
      updated: "2024-01-02T00:00:00Z",
      _localUpdated: Date.now(),
      _syncStatus: "synced",
      _syncError: null,
      _remoteVersion: "1",
    },
    {
      id: "issue-3",
      key: "TEST-3",
      projectKey: "TEST",
      summary: "Update documentation",
      description: null,
      status: "Done",
      statusCategory: "done",
      assignee: null,
      reporter: "alice",
      priority: "Low",
      issueType: "Task",
      labels: [],
      created: "2024-01-03T00:00:00Z",
      updated: "2024-01-03T00:00:00Z",
      _localUpdated: Date.now(),
      _syncStatus: "synced",
      _syncError: null,
      _remoteVersion: "1",
    },
  ];

  beforeEach(() => {
    searchService.clear();
  });

  describe("reindexAll", () => {
    it("should rebuild the entire index from issues", () => {
      searchService.reindexAll(mockIssues);

      expect(searchService.documentCount).toBe(3);
    });

    it("should replace existing index with new data", () => {
      // Initial index
      searchService.reindexAll([mockIssues[0]]);
      expect(searchService.documentCount).toBe(1);

      // Reindex with more issues
      searchService.reindexAll(mockIssues);
      expect(searchService.documentCount).toBe(3);
    });

    it("should clear index when given empty array", () => {
      searchService.reindexAll(mockIssues);
      expect(searchService.documentCount).toBe(3);

      searchService.reindexAll([]);
      expect(searchService.documentCount).toBe(0);
    });
  });

  describe("search", () => {
    beforeEach(() => {
      searchService.reindexAll(mockIssues);
    });

    it("should return empty array for empty query", () => {
      const results = searchService.search("");
      expect(results).toEqual([]);
    });

    it("should return empty array for whitespace-only query", () => {
      const results = searchService.search("   ");
      expect(results).toEqual([]);
    });

    it("should search by issue key", () => {
      const results = searchService.search("TEST-1");
      expect(results).toContain("issue-1");
    });

    it("should search by summary", () => {
      const results = searchService.search("login");
      expect(results).toContain("issue-1");
    });

    it("should search by description text", () => {
      const results = searchService.search("MiniSearch");
      expect(results).toContain("issue-2");
    });

    it("should search by labels", () => {
      const results = searchService.search("auth");
      expect(results).toContain("issue-1");
    });

    it("should search by assignee", () => {
      const results = searchService.search("alice");
      expect(results).toContain("issue-1");
    });

    it("should search by reporter", () => {
      const results = searchService.search("bob");
      expect(results).toEqual(expect.arrayContaining(["issue-1", "issue-2"]));
    });

    it("should support fuzzy search", () => {
      const results = searchService.search("logn"); // Typo for "login"
      expect(results).toContain("issue-1");
    });

    it("should support prefix search", () => {
      const results = searchService.search("log"); // Prefix for "login"
      expect(results).toContain("issue-1");
    });

    it("should return multiple results for matching query", () => {
      const results = searchService.search("TEST");
      expect(results.length).toBeGreaterThan(1);
    });

    it("should return empty array for non-matching query", () => {
      const results = searchService.search("nonexistent");
      expect(results).toEqual([]);
    });
  });

  describe("indexIssue", () => {
    it("should add a single issue to the index", () => {
      searchService.indexIssue(mockIssues[0]);

      expect(searchService.documentCount).toBe(1);

      const results = searchService.search("TEST-1");
      expect(results).toContain("issue-1");
    });

    it("should update an existing issue in the index", () => {
      searchService.indexIssue(mockIssues[0]);

      // Update the issue
      const updatedIssue = {
        ...mockIssues[0],
        summary: "Updated summary",
      };
      searchService.indexIssue(updatedIssue);

      // Should still have only 1 document
      expect(searchService.documentCount).toBe(1);

      // Search should find the updated summary
      const results = searchService.search("Updated");
      expect(results).toContain("issue-1");

      // Old summary should not match
      const oldResults = searchService.search("login");
      expect(oldResults).not.toContain("issue-1");
    });

    it("should add multiple issues to the index", () => {
      searchService.indexIssue(mockIssues[0]);
      searchService.indexIssue(mockIssues[1]);
      searchService.indexIssue(mockIssues[2]);

      expect(searchService.documentCount).toBe(3);
    });
  });

  describe("removeIssue", () => {
    beforeEach(() => {
      searchService.reindexAll(mockIssues);
    });

    it("should remove an issue from the index", () => {
      expect(searchService.documentCount).toBe(3);

      searchService.removeIssue("issue-1");

      expect(searchService.documentCount).toBe(2);

      // Should not find the removed issue
      const results = searchService.search("TEST-1");
      expect(results).not.toContain("issue-1");
    });

    it("should not affect index when removing non-existent issue", () => {
      expect(searchService.documentCount).toBe(3);

      searchService.removeIssue("non-existent");

      expect(searchService.documentCount).toBe(3);
    });

    it("should handle removing the same issue twice", () => {
      searchService.removeIssue("issue-1");
      expect(searchService.documentCount).toBe(2);

      // Second removal should be safe
      searchService.removeIssue("issue-1");
      expect(searchService.documentCount).toBe(2);
    });
  });

  describe("clear", () => {
    it("should clear the entire index", () => {
      searchService.reindexAll(mockIssues);
      expect(searchService.documentCount).toBe(3);

      searchService.clear();
      expect(searchService.documentCount).toBe(0);

      const results = searchService.search("TEST");
      expect(results).toEqual([]);
    });
  });

  describe("documentCount", () => {
    it("should return 0 for empty index", () => {
      expect(searchService.documentCount).toBe(0);
    });

    it("should return the number of indexed documents", () => {
      searchService.reindexAll(mockIssues);
      expect(searchService.documentCount).toBe(3);

      searchService.removeIssue("issue-1");
      expect(searchService.documentCount).toBe(2);
    });
  });
});
