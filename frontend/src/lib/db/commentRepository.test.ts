import { describe, it, expect, beforeEach } from "vitest";
import { db, commentRepository } from "./index";
import type { Comment } from "@/types";

function createMockComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: crypto.randomUUID(),
    issueId: "issue-1",
    body: { type: "doc", content: [] },
    author: "user@example.com",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    _syncStatus: "synced",
    ...overrides,
  };
}

describe("commentRepository", () => {
  beforeEach(async () => {
    await db.comments.clear();
  });

  describe("put", () => {
    it("stores a comment and returns its id", async () => {
      const comment = createMockComment({ id: "comment-1" });
      const id = await commentRepository.put(comment);
      expect(id).toBe("comment-1");
    });

    it("updates an existing comment", async () => {
      const comment = createMockComment();
      await commentRepository.put(comment);

      const updated = { ...comment, author: "new-author@example.com" };
      await commentRepository.put(updated);

      const stored = await db.comments.get(comment.id);
      expect(stored?.author).toBe("new-author@example.com");
    });
  });

  describe("getByIssueId", () => {
    it("returns empty array when no comments for issue", async () => {
      const result = await commentRepository.getByIssueId("non-existent");
      expect(result).toEqual([]);
    });

    it("returns all comments for an issue", async () => {
      const comment1 = createMockComment({ issueId: "issue-1" });
      const comment2 = createMockComment({ issueId: "issue-1" });
      const comment3 = createMockComment({ issueId: "issue-2" });

      await commentRepository.put(comment1);
      await commentRepository.put(comment2);
      await commentRepository.put(comment3);

      const result = await commentRepository.getByIssueId("issue-1");
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.issueId === "issue-1")).toBe(true);
    });
  });

  describe("deleteByIssueId", () => {
    it("deletes all comments for an issue", async () => {
      const comment1 = createMockComment({ issueId: "issue-1" });
      const comment2 = createMockComment({ issueId: "issue-1" });
      const comment3 = createMockComment({ issueId: "issue-2" });

      await commentRepository.put(comment1);
      await commentRepository.put(comment2);
      await commentRepository.put(comment3);

      await commentRepository.deleteByIssueId("issue-1");

      const issue1Comments = await commentRepository.getByIssueId("issue-1");
      expect(issue1Comments).toHaveLength(0);

      const issue2Comments = await commentRepository.getByIssueId("issue-2");
      expect(issue2Comments).toHaveLength(1);
    });

    it("does nothing for non-existent issue", async () => {
      // Should not throw
      await commentRepository.deleteByIssueId("non-existent");
    });
  });

  describe("bulkPut", () => {
    it("stores multiple comments at once", async () => {
      const comments = [
        createMockComment({ id: "c1" }),
        createMockComment({ id: "c2" }),
        createMockComment({ id: "c3" }),
      ];

      await commentRepository.bulkPut(comments);

      const count = await db.comments.count();
      expect(count).toBe(3);
    });
  });

  describe("delete", () => {
    it("removes a comment by id", async () => {
      const comment = createMockComment();
      await commentRepository.put(comment);

      await commentRepository.delete(comment.id);

      const stored = await db.comments.get(comment.id);
      expect(stored).toBeUndefined();
    });

    it("does nothing for non-existent id", async () => {
      // Should not throw
      await commentRepository.delete("non-existent");
    });
  });
});
