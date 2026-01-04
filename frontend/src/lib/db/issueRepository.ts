import { db } from "./index";
import type { Issue } from "@/types";

export const issueRepository = {
    getAll: async (): Promise<Issue[]> => {
        return await db.issues.toArray();
    },

    getById: async (id: string): Promise<Issue | undefined> => {
        return await db.issues.get(id);
    },

    add: async (issue: Issue): Promise<string> => {
        return await db.issues.add(issue);
    },

    update: async (id: string, updates: Partial<Issue>): Promise<number> => {
        return await db.issues.update(id, updates);
    },

    delete: async (id: string): Promise<void> => {
        return await db.issues.delete(id);
    },

    // Custom queries
    search: async (query: string): Promise<Issue[]> => {
        const lowerQuery = query.toLowerCase();
        return await db.issues
            .filter((issue) =>
                issue.summary.toLowerCase().includes(lowerQuery) ||
                issue.key.toLowerCase().includes(lowerQuery) ||
                (issue.assignee && issue.assignee.toLowerCase().includes(lowerQuery)) ||
                false
            )
            .toArray();
    }
};
