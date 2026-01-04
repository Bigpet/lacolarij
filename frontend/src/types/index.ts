// User types
export interface User {
  id: string;
  username: string;
  created_at: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

// JIRA Connection types
export interface JiraConnection {
  id: string;
  name: string;
  jira_url: string;
  email: string;
  api_version: number;
  is_default: boolean;
  created_at: string;
}

export interface JiraConnectionCreate {
  name: string;
  jira_url: string;
  email: string;
  api_token: string;
  api_version?: number;
  is_default?: boolean;
}

// Issue types (for IndexedDB)
export interface Issue {
  id: string;
  key: string;
  projectKey: string;
  summary: string;
  description: unknown | null;
  status: string;
  statusCategory: "todo" | "indeterminate" | "done";
  assignee: string | null;
  reporter: string;
  priority: string;
  issueType: string;
  labels: string[];
  created: string;
  updated: string;
  // Local metadata
  _localUpdated: number;
  _syncStatus: "synced" | "pending" | "conflict";
  _syncError: string | null;
  _remoteVersion: string;
}

export interface Comment {
  id: string;
  issueId: string;
  body: unknown;
  author: string;
  created: string;
  updated: string;
  _syncStatus: "synced" | "pending" | "conflict";
}

export interface SyncMeta {
  id: string;
  lastSyncTime: number;
  lastSyncCursor: string | null;
}

export interface PendingOperation {
  id: string;
  entityType: "issue" | "comment";
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: unknown;
  createdAt: number;
  attempts: number;
  lastError: string | null;
}

// API error type
export interface ApiError {
  detail: string;
}
