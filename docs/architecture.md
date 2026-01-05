# JiraLocal Architecture

## Overview

JiraLocal is a local-first application for managing JIRA issues offline. It syncs with JIRA Cloud/Server, stores issues locally in IndexedDB, and allows editing even without network connectivity. Changes are synchronized when online, with manual conflict resolution.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              Browser (Frontend)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐│
│  │  React Views │──│ State Manager│──│  Sync Engine │──│ Storage Layer    ││
│  │  (List/Board)│  │ (Zustand)    │  │ (Background) │  │ (IndexedDB/Cache)││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘│
└─────────────────────────────────────────────|──────────────────────────────┘
                                              │ HTTP
┌─────────────────────────────────────────────|──────────────────────────────┐
│                            Backend (Python/FastAPI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────────────────┐│
│  │ User Service │  │ Relay Service│──│ Mode Router (relay|demo)           ││
│  │ (Settings)   │  │ (CORS proxy) │  │   ├─ Real JIRA (forward requests)  ││
│  └──────────────┘  └──────────────┘  │   └─ Mock JIRA (local state)       ││
│                                       └─────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Backend Architecture

### 1.1 Module Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app factory, middleware
│   ├── config.py               # Configuration management
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py           # Main API router
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── users.py            # User management endpoints
│   │   └── relay.py            # JIRA relay proxy endpoints
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py         # Password hashing, token generation
│   │   └── exceptions.py       # Custom exceptions
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user_service.py     # User business logic
│   │   ├── relay_service.py    # JIRA request forwarding
│   │   └── mock_jira/          # Demo mode mock server
│   │       ├── __init__.py
│   │       ├── service.py      # Mock JIRA logic (from current main.py)
│   │       └── models.py       # Mock data models
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py             # User domain model
│   │   └── settings.py         # User settings model
│   │
│   └── repositories/
│       ├── __init__.py
│       └── user_repository.py  # User data access (SQLite)
│
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_relay.py
│   └── test_mock_jira.py
│
├── alembic/                    # Database migrations (optional)
├── pyproject.toml
└── config.toml
```

### 1.2 Core Services

#### 1.2.1 User Service

Handles user accounts and their JIRA connection settings.

```python
# Data model
class User:
    id: str                     # UUID
    username: str               # Local username
    password_hash: str          # Argon2 hash
    created_at: datetime

class JiraConnection:
    id: str
    user_id: str
    name: str                   # "Work JIRA", "Personal", etc.
    jira_url: str               # https://company.atlassian.net
    email: str                  # JIRA account email
    api_token: str              # Encrypted API token
    api_version: int            # 2 or 3
    is_default: bool

class UserPreferences:
    user_id: str
    default_project_key: str
    theme: str                  # light/dark/system
    board_columns: list[str]    # Preferred status columns
```

**Storage**: SQLite database (`jiralocal.db`) for simplicity and portability.

#### 1.2.2 Relay Service

Proxies requests to the actual JIRA server, handling authentication and CORS.

```python
class RelayService:
    async def forward_request(
        self,
        connection: JiraConnection,
        method: str,
        path: str,
        body: dict | None,
        query_params: dict | None
    ) -> RelayResponse:
        """
        Forward a request to JIRA, injecting authentication.

        1. Build target URL from connection.jira_url + path
        2. Add Basic Auth header (email:api_token)
        3. Forward request with httpx
        4. Return response (status, headers, body)
        """
```

**Key behaviors**:
- Injects `Authorization: Basic <base64(email:token)>` header
- Removes/adds CORS headers as needed
- Handles request/response streaming for large payloads
- Rate limiting awareness (429 responses)

#### 1.2.3 Mode Router

Decides whether to use real JIRA or mock JIRA based on configuration or request.

```python
class ModeRouter:
    def __init__(self, relay_service: RelayService, mock_service: MockJiraService):
        self.relay = relay_service
        self.mock = mock_service

    async def route(self, connection: JiraConnection, request: Request):
        if connection.jira_url == "demo://local":
            return await self.mock.handle(request)
        else:
            return await self.relay.forward_request(connection, request)
```

### 1.3 API Endpoints

```
Authentication:
POST   /api/auth/register       # Create user account
POST   /api/auth/login          # Login, get session token
POST   /api/auth/logout         # Invalidate session
GET    /api/auth/me             # Get current user

User Settings:
GET    /api/users/connections          # List JIRA connections
POST   /api/users/connections          # Add new connection
PUT    /api/users/connections/{id}     # Update connection
DELETE /api/users/connections/{id}     # Remove connection
GET    /api/users/preferences          # Get preferences
PUT    /api/users/preferences          # Update preferences

JIRA Relay (all JIRA API paths proxied):
ANY    /api/jira/{connection_id}/rest/api/...  # Forward to JIRA
```

### 1.4 Authentication Strategy

**Simple session-based auth** (good enough for single-user or small team):

1. User registers with username/password
2. Password hashed with Argon2
3. Login returns a session token (JWT or random UUID stored in DB)
4. Session token passed via `Authorization: Bearer <token>` or cookie
5. Sessions expire after configurable period (default: 30 days)

No SSO, OAuth, or external identity providers needed.

### 1.5 Configuration

```toml
# config.toml
[server]
host = "127.0.0.1"
port = 8080
debug = false

[database]
path = "./data/jiralocal.db"

[security]
session_expiry_days = 30
encryption_key = "..."  # For encrypting stored API tokens
```

---

## Part 2: Frontend Architecture

### 2.1 Technology Stack

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | React 18+ | Proven ecosystem, wide support |
| Language | TypeScript | Type safety, better tooling |
| Build | Vite | Fast builds, good DX |
| Routing | React Router v6 | Standard, flexible |
| State (UI) | Zustand | Simple, minimal boilerplate |
| State (Server) | TanStack Query | Caching, sync, background refresh |
| Storage | Dexie.js (IndexedDB) | Promise-based, good TypeScript support |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, accessible components |
| ADF Editor | TipTap | ProseMirror-based, extensible |
| Testing | Vitest + Testing Library | Fast, React-friendly |

### 2.2 Directory Structure

```
frontend/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # App shell, providers
│   ├── routes.tsx                  # Route definitions
│   │
│   ├── components/
│   │   ├── ui/                     # Base UI components (shadcn)
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── issues/
│   │   │   ├── IssueList.tsx
│   │   │   ├── IssueCard.tsx
│   │   │   ├── IssueDetail.tsx
│   │   │   ├── IssueEditor.tsx
│   │   │   └── IssueFilters.tsx
│   │   ├── board/
│   │   │   ├── BoardView.tsx
│   │   │   ├── BoardColumn.tsx
│   │   │   └── QuickFilters.tsx
│   │   ├── editor/
│   │   │   ├── AdfEditor.tsx       # TipTap-based ADF editor
│   │   │   └── extensions/         # Custom TipTap extensions
│   │   └── sync/
│   │       ├── SyncStatusBar.tsx   # Shows sync state
│   │       └── ConflictResolver.tsx
│   │
│   ├── features/                   # Feature modules
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── useAuth.ts
│   │   │   └── authStore.ts
│   │   ├── issues/
│   │   │   ├── useIssues.ts        # React Query hooks
│   │   │   ├── issueService.ts     # API calls
│   │   │   └── issueTypes.ts
│   │   ├── settings/
│   │   │   ├── SettingsPage.tsx
│   │   │   └── ConnectionForm.tsx
│   │   └── sync/
│   │       ├── syncEngine.ts       # Core sync logic
│   │       ├── syncStore.ts        # Sync state (Zustand)
│   │       └── conflictService.ts
│   │
│   ├── lib/
│   │   ├── api.ts                  # HTTP client wrapper
│   │   ├── db/
│   │   │   ├── index.ts            # Dexie database setup
│   │   │   ├── schema.ts           # IndexedDB schema
│   │   │   ├── issueRepository.ts  # Issue CRUD
│   │   │   └── syncMetaRepository.ts
│   │   └── utils/
│   │       ├── adf.ts              # ADF helpers
│   │       └── jql.ts              # JQL parsing utilities
│   │
│   ├── stores/
│   │   ├── appStore.ts             # Global app state
│   │   └── filterStore.ts          # Filter/search state
│   │
│   └── types/
│       ├── jira.ts                 # JIRA API types
│       ├── sync.ts                 # Sync-related types
│       └── index.ts
│
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 2.3 Core Concepts

#### 2.3.1 Local-First Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW DIAGRAM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   USER ACTION                                                                │
│       │                                                                      │
│       ▼                                                                      │
│   ┌────────────────┐                                                         │
│   │ React Component│                                                         │
│   └───────┬────────┘                                                         │
│           │ useMutation()                                                    │
│           ▼                                                                  │
│   ┌────────────────┐    optimistic    ┌────────────────┐                    │
│   │  Issue Service │────update───────▶│ IndexedDB      │                    │
│   │ (issueService) │                  │ (Dexie)        │                    │
│   └───────┬────────┘                  └───────┬────────┘                    │
│           │                                   │                              │
│           │ mark dirty                        │ triggers                     │
│           ▼                                   ▼                              │
│   ┌────────────────┐                  ┌────────────────┐                    │
│   │  Sync Queue    │◀─────────────────│ React Query    │                    │
│   │ (pending ops)  │                  │ (re-renders)   │                    │
│   └───────┬────────┘                  └────────────────┘                    │
│           │                                                                  │
│           │ background (when online)                                         │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  Sync Engine   │───────────────────────▶ Backend ───────▶ JIRA          │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           │ on success: clear dirty flag                                     │
│           │ on conflict: mark conflict                                       │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  Conflict UI   │ (if needed)                                            │
│   └────────────────┘                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2.3.2 IndexedDB Schema

```typescript
// lib/db/schema.ts
import Dexie, { Table } from 'dexie';

interface Issue {
  id: string;                   // JIRA issue ID
  key: string;                  // PROJECT-123
  projectKey: string;
  summary: string;
  description: object | null;   // ADF document
  status: string;
  statusCategory: 'todo' | 'indeterminate' | 'done';
  assignee: string | null;
  reporter: string;
  priority: string;
  issueType: string;
  labels: string[];
  created: string;
  updated: string;              // JIRA's updated timestamp

  // Local metadata
  _localUpdated: number;        // Local timestamp of last edit
  _syncStatus: 'synced' | 'pending' | 'conflict';
  _syncError: string | null;
  _remoteVersion: string;       // ETag or updated timestamp for conflict detection
}

interface Comment {
  id: string;
  issueId: string;
  body: object;                 // ADF
  author: string;
  created: string;
  updated: string;
  _syncStatus: 'synced' | 'pending' | 'conflict';
}

interface SyncMeta {
  id: string;                   // 'last_sync' or connection ID
  lastSyncTime: number;
  lastSyncCursor: string | null;
}

interface PendingOperation {
  id: string;                   // UUID
  entityType: 'issue' | 'comment';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: object;
  createdAt: number;
  attempts: number;
  lastError: string | null;
}

class JiraLocalDatabase extends Dexie {
  issues!: Table<Issue, string>;
  comments!: Table<Comment, string>;
  syncMeta!: Table<SyncMeta, string>;
  pendingOperations!: Table<PendingOperation, string>;

  constructor() {
    super('jiralocal');
    this.version(1).stores({
      issues: 'id, key, projectKey, status, statusCategory, assignee, _syncStatus',
      comments: 'id, issueId',
      syncMeta: 'id',
      pendingOperations: 'id, entityType, entityId, createdAt'
    });
  }
}
```

#### 2.3.3 Sync Engine

The sync engine runs in the background and handles:

1. **Initial Sync**: Download all issues matching user's filter (project, JQL)
2. **Incremental Sync**: Periodically fetch changes since last sync
3. **Push Sync**: Upload local changes to JIRA
4. **Conflict Detection**: Compare versions before overwriting

```typescript
// features/sync/syncEngine.ts

interface SyncEngine {
  // State
  status: 'idle' | 'syncing' | 'error';
  lastSync: Date | null;
  pendingCount: number;
  conflicts: Conflict[];

  // Actions
  startSync(): Promise<void>;      // Manual trigger
  pauseSync(): void;
  resumeSync(): void;

  // Listeners
  onStatusChange(callback: (status: SyncStatus) => void): () => void;
}

class SyncEngineImpl implements SyncEngine {
  private intervalId: number | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor(
    private db: JiraLocalDatabase,
    private api: ApiClient,
    private store: SyncStore
  ) {
    // Listen for online/offline
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Start periodic sync if online
    if (this.isOnline) {
      this.scheduleSync();
    }
  }

  async startSync(): Promise<void> {
    this.store.setStatus('syncing');

    try {
      // 1. Push local changes first
      await this.pushPendingChanges();

      // 2. Pull remote changes
      await this.pullRemoteChanges();

      this.store.setStatus('idle');
      this.store.setLastSync(new Date());
    } catch (error) {
      this.store.setStatus('error');
      this.store.setError(error.message);
    }
  }

  private async pushPendingChanges(): Promise<void> {
    const pending = await this.db.pendingOperations
      .orderBy('createdAt')
      .toArray();

    for (const op of pending) {
      try {
        await this.executePendingOperation(op);
        await this.db.pendingOperations.delete(op.id);
      } catch (error) {
        if (this.isConflict(error)) {
          await this.handleConflict(op, error);
        } else {
          // Retry later
          await this.db.pendingOperations.update(op.id, {
            attempts: op.attempts + 1,
            lastError: error.message
          });
        }
      }
    }
  }

  private async pullRemoteChanges(): Promise<void> {
    const syncMeta = await this.db.syncMeta.get('last_sync');
    const since = syncMeta?.lastSyncTime;

    // Use JIRA's search with updated >= since
    const jql = since
      ? `updated >= "${formatJiraDate(since)}" ORDER BY updated ASC`
      : 'created >= -3000w ORDER BY updated ASC';

    let nextPageToken: string | undefined = undefined;
    const maxResults = 100;

    while (true) {
      const response = await this.api.searchIssues({ jql, nextPageToken, maxResults });

      for (const remoteIssue of response.issues) {
        await this.mergeRemoteIssue(remoteIssue);
      }

      // Check if there's a next page
      if (!response.nextPageToken) break;
      nextPageToken = response.nextPageToken;
    }

    await this.db.syncMeta.put({
      id: 'last_sync',
      lastSyncTime: Date.now(),
      lastSyncCursor: null
    });
  }

  private async mergeRemoteIssue(remote: JiraIssue): Promise<void> {
    const local = await this.db.issues.get(remote.id);

    if (!local) {
      // New issue from remote
      await this.db.issues.add(this.mapToLocal(remote));
      return;
    }

    if (local._syncStatus === 'pending') {
      // Local has unpushed changes - potential conflict
      if (remote.fields.updated !== local._remoteVersion) {
        // Remote changed too - conflict!
        await this.db.issues.update(local.id, {
          _syncStatus: 'conflict',
          _remoteVersion: remote.fields.updated
        });
        this.store.addConflict({
          entityType: 'issue',
          entityId: local.id,
          local: local,
          remote: this.mapToLocal(remote)
        });
      }
      // If remote hasn't changed, keep local version for push
    } else {
      // No local changes - just update
      await this.db.issues.put(this.mapToLocal(remote));
    }
  }
}
```

#### 2.3.4 Conflict Resolution

Conflicts are surfaced to the user with a clear UI:

```typescript
interface Conflict {
  id: string;
  entityType: 'issue' | 'comment';
  entityId: string;
  entityKey?: string;           // e.g., "PROJECT-123"
  field?: string;               // If conflict is field-specific
  localValue: unknown;
  remoteValue: unknown;
  localTimestamp: number;
  remoteTimestamp: string;
}

// Resolution options
type Resolution =
  | { type: 'keep_local' }
  | { type: 'keep_remote' }
  | { type: 'manual'; value: unknown };
```

**UI Pattern**: A banner appears when conflicts exist. Clicking opens a modal showing side-by-side comparison with "Keep Mine", "Keep Theirs", or manual edit option.

### 2.4 Views

#### 2.4.1 Issue List View

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search issues...                          [Filters ▼]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ □ PROJECT-123  Bug   Fix login redirect     @alice  To Do  │ │
│ │ □ PROJECT-124  Task  Update dependencies    @bob    Done   │ │
│ │ □ PROJECT-125  Story User profile page      @alice  In Pr..│ │
│ │ ...                                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Showing 1-50 of 234                              [< 1 2 3 4 >] │
└─────────────────────────────────────────────────────────────────┘
```

Features:
- Full-text search across summary, description, comments
- Filters: Status, Assignee, Labels, Type, Date range
- Sorting by multiple fields
- Bulk selection for operations
- Virtual scrolling for large lists

#### 2.4.2 Board View (Kanban)

```
┌─────────────────────────────────────────────────────────────────┐
│ Quick Filters: [My Issues] [Recently Updated] [High Priority]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TO DO (5)          IN PROGRESS (3)       DONE (12)             │
│ ┌──────────────┐   ┌──────────────┐   ┌──────────────┐          │
│ │ PROJECT-123  │   │ PROJECT-120  │   │ PROJECT-118  │          │
│ │ Fix login    │   │ Add tests    │   │ Deploy v2    │          │
│ │ 🐛 @alice    │   │ ✨ @bob      │   │ 🚀 @charlie  │          │
│ └──────────────┘   └──────────────┘   └──────────────┘          │
│ ┌──────────────┐   ┌──────────────┐   ┌──────────────┐          │
│ │ PROJECT-124  │   │ PROJECT-121  │   │ PROJECT-119  │          │
│ │ Update deps  │   │ Refactor API │   │ Fix bug #42  │          │
│ │ 📋 @bob      │   │ 🔧 @alice    │   │ 🐛 @alice    │          │
│ └──────────────┘   └──────────────┘   └──────────────┘          │
│       ...                                    ...                 │
└─────────────────────────────────────────────────────────────────┘
```

Features:
- Drag-and-drop between columns (triggers transition)
- Quick filters (buttons that apply common JQL)
- Customizable columns based on project workflow
- Card previews with key info
- Click to open detail view

#### 2.4.3 Issue Detail View

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back                                           [⟳] [⋮]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ PROJECT-123                                                      │
│ ══════════════════════════════════════════════════              │
│ # Fix login redirect after password reset                       │
│                                                                  │
│ Status: [To Do ▼]    Type: 🐛 Bug    Priority: High             │
│ Assignee: @alice     Reporter: @bob                              │
│                                                                  │
│ ─────────────────────────────────────────────────               │
│ Description                                         [Edit]      │
│ ─────────────────────────────────────────────────               │
│ When a user resets their password and clicks the link in the   │
│ email, they are redirected to /dashboard instead of /login.    │
│                                                                  │
│ **Steps to reproduce:**                                          │
│ 1. Go to /forgot-password                                       │
│ 2. Enter email and submit                                       │
│ 3. Click link in email                                          │
│                                                                  │
│ ─────────────────────────────────────────────────               │
│ Comments (3)                                                     │
│ ─────────────────────────────────────────────────               │
│ @bob · 2 hours ago                                              │
│ I can reproduce this. Looks like the redirect URL is wrong.    │
│                                                                  │
│ @alice · 1 hour ago                                             │
│ Found the bug in auth.js line 145. Working on a fix.           │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Add a comment...                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

Features:
- Rich ADF editor for description and comments
- Inline status transitions
- Attachment viewing (cached locally)
- Activity stream
- Related issues / links

### 2.5 ADF Editor

The Atlassian Document Format (ADF) editor is crucial for JIRA compatibility.

**Approach**: Use TipTap (ProseMirror-based) with custom extensions that map to ADF nodes.

```typescript
// components/editor/AdfEditor.tsx

const AdfEditor = ({ content, onChange, editable = true }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TaskList,
      TaskItem,
      Mention.configure({ /* for @mentions */ }),
      // Custom ADF extensions
      AdfPanel,
      AdfCodeBlock,
      AdfMediaSingle,
    ],
    content: adfToProsemirror(content),
    editable,
    onUpdate: ({ editor }) => {
      const adf = prosemirrorToAdf(editor.getJSON());
      onChange(adf);
    },
  });

  return <EditorContent editor={editor} />;
};
```

Key ADF node mappings:
| ADF Type | ProseMirror/TipTap |
|----------|-------------------|
| doc | doc |
| paragraph | paragraph |
| heading | heading |
| bulletList | bulletList |
| orderedList | orderedList |
| listItem | listItem |
| codeBlock | codeBlock |
| blockquote | blockquote |
| table, tableRow, tableCell | Table extension |
| panel | Custom extension |
| mention | Mention extension |
| emoji | Custom extension |

---

## Part 3: Sync Strategy Deep Dive

### 3.1 Sync States

Each synced entity has a sync status:

```
┌─────────┐    local edit    ┌─────────┐   push success   ┌─────────┐
│ synced  │ ───────────────▶ │ pending │ ───────────────▶ │ synced  │
└─────────┘                  └─────────┘                  └─────────┘
                                  │                            │
                                  │ remote changed             │ remote changed
                                  ▼                            ▼
                            ┌──────────┐              (auto-merge if no
                            │ conflict │               local changes)
                            └──────────┘
                                  │
                                  │ user resolves
                                  ▼
                            ┌─────────┐
                            │ synced  │
                            └─────────┘
```

### 3.2 Conflict Detection

Conflicts detected via version comparison:

1. **On push**: Before updating JIRA, check if `updated` timestamp matches what we last saw
2. **On pull**: Before overwriting local, check if local has `pending` status

```typescript
async function pushIssueUpdate(issue: Issue): Promise<void> {
  // Optimistic locking via If-Match header (ETag) or manual check
  const remote = await api.getIssue(issue.id);

  if (remote.fields.updated !== issue._remoteVersion) {
    throw new ConflictError(issue, remote);
  }

  await api.updateIssue(issue.id, {
    fields: { summary: issue.summary, description: issue.description }
  });
}
```

### 3.3 Non-Blocking Sync

Sync must never block UI operations:

1. **Writes are optimistic**: UI updates immediately, sync happens in background
2. **Reads are local-first**: Always read from IndexedDB, show stale indicator if needed
3. **Sync status is observable**: Components subscribe to sync state for UI indicators

```typescript
// Sync status indicator in header
const SyncStatusBar = () => {
  const { status, lastSync, pendingCount, conflicts } = useSyncStore();

  return (
    <div className="sync-status">
      {status === 'syncing' && <Spinner />}
      {status === 'idle' && <CheckIcon />}
      {status === 'error' && <AlertIcon />}

      {pendingCount > 0 && (
        <Badge>{pendingCount} pending</Badge>
      )}

      {conflicts.length > 0 && (
        <Badge variant="warning" onClick={openConflictResolver}>
          {conflicts.length} conflicts
        </Badge>
      )}

      <span className="text-muted">
        Last sync: {formatRelative(lastSync)}
      </span>
    </div>
  );
};
```

---

## Part 4: Testing Strategy

### 4.1 Backend Testing

```
backend/tests/
├── unit/
│   ├── test_user_service.py      # Service logic tests
│   ├── test_relay_service.py
│   └── test_conflict_detection.py
├── integration/
│   ├── test_api_endpoints.py     # FastAPI TestClient
│   └── test_database.py          # SQLite operations
└── e2e/
    └── test_full_flow.py         # User journey tests
```

**Mock JIRA** used for integration tests (already exists).

### 4.2 Frontend Testing

```
frontend/src/
├── __tests__/
│   ├── components/
│   │   ├── IssueList.test.tsx
│   │   └── IssueCard.test.tsx
│   ├── features/
│   │   ├── sync/
│   │   │   ├── syncEngine.test.ts    # Unit tests
│   │   │   └── conflictService.test.ts
│   │   └── issues/
│   │       └── useIssues.test.tsx    # Hook tests
│   └── lib/
│       ├── db.test.ts                 # IndexedDB tests (fake-indexeddb)
│       └── adf.test.ts                # ADF conversion tests
└── e2e/                               # Playwright tests
    ├── login.spec.ts
    ├── issues.spec.ts
    └── sync.spec.ts
```

**Key testing tools**:
- `vitest` for unit/integration
- `@testing-library/react` for components
- `fake-indexeddb` for IndexedDB mocking
- `msw` (Mock Service Worker) for API mocking
- `playwright` for E2E

### 4.3 Integration Testing

Frontend + Backend together:

1. Start backend with mock JIRA mode
2. Run Playwright tests against frontend
3. Verify full user flows work

---

## Part 5: Implementation Phases

### Phase 1: Foundation
- Set up project structure (monorepo with backend/ and frontend/)
- Implement backend user service and basic auth
- Implement frontend shell with routing
- Set up IndexedDB schema and basic CRUD

### Phase 2: Core Features
- Implement relay service with JIRA forwarding
- Build issue list view with local storage
- Build issue detail view with ADF editor
- Implement basic sync (pull only)

### Phase 3: Sync Engine
- Implement push sync for local changes
- Add conflict detection
- Build conflict resolution UI
- Add sync status indicators

### Phase 4: Board View
- Implement Kanban board
- Add drag-and-drop transitions
- Implement quick filters
- Add column customization

### Phase 5: Polish
- Full-text search
- Attachment caching
- Offline indicators
- Performance optimization
- Comprehensive testing

---

## Appendix A: Key Decisions Summary

| Decision | Choice | Alternatives Considered |
|----------|--------|------------------------|
| State Management | Zustand + TanStack Query | Redux, Jotai, MobX |
| Local Storage | IndexedDB via Dexie | localStorage, SQLite (via WASM) |
| ADF Editor | TipTap | Slate.js, Quill, ProseMirror directly |
| Backend DB | SQLite | PostgreSQL, file-based JSON |
| API Framework | FastAPI | Flask, Django, Starlette |
| Frontend Framework | React | Vue, Svelte, Solid |
| CSS | Tailwind + shadcn/ui | CSS Modules, Styled Components |

## Appendix B: API Types Reference

See `docs/jira/v3/` for full JIRA API documentation.

Key types to implement:
- Issue (fields, changelog, comments)
- Comment
- Transition
- User
- Project
- Priority
- Status
- IssueType
