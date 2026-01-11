/**
 * Tests for issueService
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { issueService } from "./issueService";
import { issueRepository, pendingOperationsRepository } from "@/lib/db";
import { useSyncStore } from "@/stores/syncStore";
import type { Issue } from "@/types";

// Mock the db module
vi.mock("@/lib/db", () => ({
  issueRepository: {
    put: vi.fn(),
    getById: vi.fn(),
  },
  pendingOperationsRepository: {
    add: vi.fn(),
    deleteByEntityId: vi.fn(),
    count: vi.fn(),
  },
}));

describe("issueService", () => {
  const mockIssue: Issue = {
    id: "issue-1",
    key: "TEST-1",
    projectKey: "TEST",
    summary: "Test issue",
    description: null,
    status: "Open",
    statusCategory: "todo",
    assignee: "alice",
    reporter: "bob",
    priority: "High",
    issueType: "Bug",
    labels: [],
    created: "2024-01-01T00:00:00Z",
    updated: "2024-01-01T00:00:00Z",
    _localUpdated: Date.now(),
    _syncStatus: "synced",
    _syncError: null,
    _remoteVersion: "1",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset sync store
    useSyncStore.getState().reset();

    // Setup default mocks
    vi.mocked(issueRepository.getById).mockResolvedValue(mockIssue);
    vi.mocked(pendingOperationsRepository.count).mockResolvedValue(0);
    vi.mocked(pendingOperationsRepository.add).mockResolvedValue("pending-op-1");
    vi.mocked(pendingOperationsRepository.deleteByEntityId).mockResolvedValue(1);
    vi.mocked(issueRepository.put).mockResolvedValue(undefined);
  });

  describe("updateSummary", () => {
    it("should update the issue summary locally", async () => {
      await issueService.updateSummary("issue-1", "New summary");

      expect(issueRepository.put).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: "New summary",
          _syncStatus: "pending",
        })
      );
    });

    it("should queue a pending operation", async () => {
      await issueService.updateSummary("issue-1", "New summary");

      expect(pendingOperationsRepository.add).toHaveBeenCalledWith({
        entityType: "issue",
        entityId: "issue-1",
        operation: "update",
        payload: { fields: { summary: "New summary" } },
        createdAt: expect.any(Number),
        attempts: 0,
        lastError: null,
      });
    });

    it("should update pending count in store", async () => {
      vi.mocked(pendingOperationsRepository.count).mockResolvedValue(5);

      await issueService.updateSummary("issue-1", "New summary");

      expect(useSyncStore.getState().pendingCount).toBe(5);
    });

    it("should throw error when issue not found", async () => {
      vi.mocked(issueRepository.getById).mockResolvedValue(undefined);

      await expect(issueService.updateSummary("non-existent", "New summary")).rejects.toThrow(
        "Issue not found"
      );
    });

    it("should set _localUpdated timestamp", async () => {
      const beforeUpdate = Date.now();

      await issueService.updateSummary("issue-1", "New summary");

      const putCall = vi.mocked(issueRepository.put).mock.calls[0][0];
      expect(putCall._localUpdated).toBeGreaterThanOrEqual(beforeUpdate);
    });
  });

  describe("updateDescription", () => {
    const adfDescription = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "New description" }],
        },
      ],
    };

    it("should update the issue description locally", async () => {
      await issueService.updateDescription("issue-1", adfDescription);

      expect(issueRepository.put).toHaveBeenCalledWith(
        expect.objectContaining({
          description: adfDescription,
          _syncStatus: "pending",
        })
      );
    });

    it("should queue a pending operation", async () => {
      await issueService.updateDescription("issue-1", adfDescription);

      expect(pendingOperationsRepository.add).toHaveBeenCalledWith({
        entityType: "issue",
        entityId: "issue-1",
        operation: "update",
        payload: { fields: { description: adfDescription } },
        createdAt: expect.any(Number),
        attempts: 0,
        lastError: null,
      });
    });

    it("should update pending count in store", async () => {
      vi.mocked(pendingOperationsRepository.count).mockResolvedValue(3);

      await issueService.updateDescription("issue-1", adfDescription);

      expect(useSyncStore.getState().pendingCount).toBe(3);
    });

    it("should throw error when issue not found", async () => {
      vi.mocked(issueRepository.getById).mockResolvedValue(undefined);

      await expect(issueService.updateDescription("non-existent", null)).rejects.toThrow("Issue not found");
    });

    it("should set _localUpdated timestamp", async () => {
      const beforeUpdate = Date.now();

      await issueService.updateDescription("issue-1", adfDescription);

      const putCall = vi.mocked(issueRepository.put).mock.calls[0][0];
      expect(putCall._localUpdated).toBeGreaterThanOrEqual(beforeUpdate);
    });
  });

  describe("transitionIssue", () => {
    it("should update the issue status locally", async () => {
      const targetStatus = {
        name: "In Progress",
        category: "indeterminate" as const,
      };

      await issueService.transitionIssue("issue-1", "transition-1", targetStatus);

      expect(issueRepository.put).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "In Progress",
          statusCategory: "indeterminate",
          _syncStatus: "pending",
        })
      );
    });

    it("should queue a transition pending operation", async () => {
      const targetStatus = {
        name: "Done",
        category: "done" as const,
      };

      await issueService.transitionIssue("issue-1", "transition-1", targetStatus);

      expect(pendingOperationsRepository.add).toHaveBeenCalledWith({
        entityType: "issue",
        entityId: "issue-1",
        operation: "update",
        payload: { transition: { id: "transition-1" } },
        createdAt: expect.any(Number),
        attempts: 0,
        lastError: null,
      });
    });

    it("should update pending count in store", async () => {
      vi.mocked(pendingOperationsRepository.count).mockResolvedValue(2);

      await issueService.transitionIssue("issue-1", "transition-1", {
        name: "Done",
        category: "done",
      });

      expect(useSyncStore.getState().pendingCount).toBe(2);
    });

    it("should throw error when issue not found", async () => {
      vi.mocked(issueRepository.getById).mockResolvedValue(undefined);

      await expect(
        issueService.transitionIssue("non-existent", "transition-1", {
          name: "Done",
          category: "done",
        })
      ).rejects.toThrow("Issue not found");
    });

    it("should set _localUpdated timestamp", async () => {
      const beforeUpdate = Date.now();

      await issueService.transitionIssue("issue-1", "transition-1", {
        name: "In Progress",
        category: "indeterminate",
      });

      const putCall = vi.mocked(issueRepository.put).mock.calls[0][0];
      expect(putCall._localUpdated).toBeGreaterThanOrEqual(beforeUpdate);
    });
  });

  describe("markSynced", () => {
    it("should mark issue as synced", async () => {
      await issueService.markSynced("issue-1", "2024-01-02T00:00:00Z");

      expect(issueRepository.put).toHaveBeenCalledWith(
        expect.objectContaining({
          _syncStatus: "synced",
          _remoteVersion: "2024-01-02T00:00:00Z",
          _syncError: null,
        })
      );
    });

    it("should throw error when issue not found", async () => {
      vi.mocked(issueRepository.getById).mockResolvedValue(undefined);

      await expect(issueService.markSynced("non-existent", "v2")).rejects.toThrow("Issue not found");
    });
  });

  describe("markConflict", () => {
    const remoteIssue: Issue = {
      ...mockIssue,
      id: "issue-1-remote",
      summary: "Remote summary",
      _remoteVersion: "2",
    };

    it("should mark issue as conflict", async () => {
      await issueService.markConflict("issue-1", remoteIssue);

      expect(issueRepository.put).toHaveBeenCalledWith(
        expect.objectContaining({
          _syncStatus: "conflict",
        })
      );
    });

    it("should add conflict to sync store", async () => {
      await issueService.markConflict("issue-1", remoteIssue);

      const conflicts = useSyncStore.getState().conflicts;
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toMatchObject({
        entityType: "issue",
        entityId: "issue-1",
        entityKey: "TEST-1",
        localValue: mockIssue,
        remoteValue: remoteIssue,
      });
    });

    it("should generate unique conflict id with timestamp", async () => {
      await issueService.markConflict("issue-1", remoteIssue);

      const conflict = useSyncStore.getState().conflicts[0];
      expect(conflict.id).toMatch(/^issue-1-\d+$/);
    });

    it("should throw error when issue not found", async () => {
      vi.mocked(issueRepository.getById).mockResolvedValue(undefined);

      await expect(issueService.markConflict("non-existent", remoteIssue)).rejects.toThrow("Issue not found");
    });
  });

  describe("discardLocalChanges", () => {
    const remoteIssue: Issue = {
      ...mockIssue,
      summary: "Remote summary",
      status: "Done",
      statusCategory: "done",
      _remoteVersion: "2",
    };

    it("should replace local issue with remote version", async () => {
      await issueService.discardLocalChanges("issue-1", remoteIssue);

      expect(issueRepository.put).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: "Remote summary",
          status: "Done",
          statusCategory: "done",
          _syncStatus: "synced",
        })
      );
    });

    it("should remove pending operations for the issue", async () => {
      await issueService.discardLocalChanges("issue-1", remoteIssue);

      expect(pendingOperationsRepository.deleteByEntityId).toHaveBeenCalledWith("issue-1");
    });

    it("should update pending count in store", async () => {
      vi.mocked(pendingOperationsRepository.count).mockResolvedValue(0);

      await issueService.discardLocalChanges("issue-1", remoteIssue);

      expect(pendingOperationsRepository.count).toHaveBeenCalled();
      expect(useSyncStore.getState().pendingCount).toBe(0);
    });
  });
});
