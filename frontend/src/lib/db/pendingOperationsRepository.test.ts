import { describe, it, expect, beforeEach } from "vitest";
import { db, pendingOperationsRepository } from "./index";
import type { PendingOperation } from "@/types";

function createMockOperation(
  overrides: Partial<Omit<PendingOperation, "id">> = {}
): Omit<PendingOperation, "id"> {
  return {
    entityType: "issue",
    entityId: crypto.randomUUID(),
    operation: "update",
    payload: { summary: "Updated" },
    createdAt: Date.now(),
    attempts: 0,
    lastError: null,
    ...overrides,
  };
}

describe("pendingOperationsRepository", () => {
  beforeEach(async () => {
    await db.pendingOperations.clear();
  });

  describe("add", () => {
    it("adds an operation and returns an id", async () => {
      const op = createMockOperation();
      const id = await pendingOperationsRepository.add(op);

      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
    });

    it("stores the operation with all fields", async () => {
      const op = createMockOperation({ entityId: "issue-123" });
      const id = await pendingOperationsRepository.add(op);

      const stored = await db.pendingOperations.get(id);
      expect(stored?.entityId).toBe("issue-123");
      expect(stored?.entityType).toBe("issue");
    });
  });

  describe("getAll", () => {
    it("returns empty array when no operations", async () => {
      const result = await pendingOperationsRepository.getAll();
      expect(result).toEqual([]);
    });

    it("returns all operations ordered by createdAt", async () => {
      const op1 = createMockOperation({ createdAt: 1000 });
      const op2 = createMockOperation({ createdAt: 3000 });
      const op3 = createMockOperation({ createdAt: 2000 });

      await pendingOperationsRepository.add(op1);
      await pendingOperationsRepository.add(op2);
      await pendingOperationsRepository.add(op3);

      const result = await pendingOperationsRepository.getAll();
      expect(result).toHaveLength(3);
      expect(result[0].createdAt).toBe(1000);
      expect(result[1].createdAt).toBe(2000);
      expect(result[2].createdAt).toBe(3000);
    });
  });

  describe("updateAttempt", () => {
    it("increments attempts count", async () => {
      const op = createMockOperation({ attempts: 0 });
      const id = await pendingOperationsRepository.add(op);

      await pendingOperationsRepository.updateAttempt(id, null);

      const stored = await db.pendingOperations.get(id);
      expect(stored?.attempts).toBe(1);
    });

    it("stores the error message", async () => {
      const op = createMockOperation();
      const id = await pendingOperationsRepository.add(op);

      await pendingOperationsRepository.updateAttempt(id, "Network error");

      const stored = await db.pendingOperations.get(id);
      expect(stored?.lastError).toBe("Network error");
    });

    it("does nothing for non-existent id", async () => {
      // Should not throw
      await pendingOperationsRepository.updateAttempt("non-existent", "Error");
    });
  });

  describe("deleteByEntityId", () => {
    it("deletes all operations for an entity", async () => {
      const entityId = "shared-entity";
      await pendingOperationsRepository.add(
        createMockOperation({ entityId, operation: "update" })
      );
      await pendingOperationsRepository.add(
        createMockOperation({ entityId, operation: "update" })
      );
      await pendingOperationsRepository.add(
        createMockOperation({ entityId: "other-entity" })
      );

      await pendingOperationsRepository.deleteByEntityId(entityId);

      const all = await pendingOperationsRepository.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].entityId).toBe("other-entity");
    });
  });

  describe("count", () => {
    it("returns 0 when empty", async () => {
      const count = await pendingOperationsRepository.count();
      expect(count).toBe(0);
    });

    it("returns the number of operations", async () => {
      await pendingOperationsRepository.add(createMockOperation());
      await pendingOperationsRepository.add(createMockOperation());

      const count = await pendingOperationsRepository.count();
      expect(count).toBe(2);
    });
  });

  describe("delete", () => {
    it("removes a single operation by id", async () => {
      const id = await pendingOperationsRepository.add(createMockOperation());
      await pendingOperationsRepository.add(createMockOperation());

      await pendingOperationsRepository.delete(id);

      const count = await pendingOperationsRepository.count();
      expect(count).toBe(1);
    });
  });

  describe("getByEntityId", () => {
    it("returns operations for a specific entity", async () => {
      const entityId = "target-entity";
      await pendingOperationsRepository.add(
        createMockOperation({ entityId })
      );
      await pendingOperationsRepository.add(
        createMockOperation({ entityId: "other" })
      );

      const result =
        await pendingOperationsRepository.getByEntityId(entityId);
      expect(result).toHaveLength(1);
      expect(result[0].entityId).toBe(entityId);
    });
  });
});
