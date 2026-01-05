# Project State

State: Phase 3 Sync Engine complete

past:

* [x] create simple proof of concept (to be discarded later)
* [x] download the REST API docs for JIRA for use in later queries
  * [x] used OpenAPI JIRA v3 spec to generate Markdown files in `./docs/jira/v3`
  * [x] downloaded the JIRA v2 docs as well for JIRA server and generated Markdown files in `./docs/jira/v2`
* [x] create mock JIRA server that can be used to test the frontend v2 and v3
  * [x] create, transition, edit issues, add comments
  * [x] verify tests by running against acutal JIRA server


* [x] create an architecture documents for the application based on the following lessons from the Proof of Concept:
    * backend:
      * We will need a relay server to forward requests to JIRA (to work around CORS)
      * We want to have a dummy JIRA server implementation for a demo mode
      * We want simple user-management to store settings (no SSO or other fancy things needed, mostly just storing connection settings to JIRA)
    * frontend:
      * SPA typescript application with React
      * Will sync with JIRA through the relay server
      * Will store the state in IndexedDB (images can be cached with CacheStorage)
      * synching conflicts should be able to be manually resolved, no accidental overwriting
      * synching state should be able to be monitored, but never be blocking operation
      * should contain a tasklist with various filters (simple full-text search for now, JQL compatibility later)
      * should be able to render/edit adf descriptions/text including tables (can be done with dependency)
      * should have a detail view for issues
      * should have a status lanes view and quick-filters
    * well tested, including integration tests

* [x] Phase 1 Foundation - create simple user account and settings storage backend
  * [x] Modular FastAPI backend with user auth (JWT, Argon2 password hashing)
  * [x] SQLite database with SQLAlchemy ORM
  * [x] JIRA connection management with Fernet-encrypted API tokens
  * [x] Mock JIRA server moved to services/mock_jira/
* [x] Phase 1 Foundation - create SPA local-first frontend
  * [x] Vite + React + TypeScript setup
  * [x] Tailwind CSS with shadcn/ui-style components
  * [x] IndexedDB schema with Dexie (issues, comments, sync metadata)
  * [x] Zustand auth store with persistence
  * [x] Login/Register pages with routing
  * [x] Settings page for JIRA connection management

* [x] Phase 2: Core Features
  * [x] Implement relay service for JIRA forwarding
    * Created `backend/app/services/relay_service.py` for proxying requests to JIRA
    * Created `backend/app/api/relay.py` for API endpoints
    * Support for both API v2 and v3, handles authentication and CORS
  * [x] Build issue list view with local storage
    * Created `frontend/src/lib/db/index.ts` with Dexie IndexedDB schema
    * Created `frontend/src/components/issues/IssueList.tsx` and `IssueCard.tsx`
    * Search and filter functionality
  * [x] Build issue detail view
    * Created `frontend/src/components/issues/IssueDetail.tsx`
    * Basic ADF rendering for description and comments
    * Added route `/issues/:issueId`
  * [x] Implement basic sync (pull only)
    * Created `frontend/src/features/sync/syncEngine.ts`
    * Created `frontend/src/stores/syncStore.ts` for sync state
    * Created `frontend/src/components/sync/SyncStatusBar.tsx`
    * Incremental sync with last-sync tracking

* [x] Phase 3: Sync Engine
  * [x] Implement push sync for local changes
    * Created `frontend/src/features/issues/issueService.ts` for local-first mutations
    * Modified `frontend/src/features/sync/syncEngine.ts` with `pushPendingChanges()` method
    * Queues operations in pendingOperations table, processes on sync
  * [x] Add conflict detection
    * Version checking via `_remoteVersion` comparison before push
    * Conflict detection during pull for pending issues
    * Created `frontend/src/features/sync/conflictService.ts`
  * [x] Build conflict resolution UI
    * Created `frontend/src/components/sync/ConflictResolver.tsx` - side-by-side comparison modal
    * Created `frontend/src/components/sync/ConflictBanner.tsx` - notification banner
    * "Keep Mine" and "Keep Theirs" resolution options
  * [x] Add sync status indicators
    * IssueCard shows synced/pending/conflict icons (already existed)
    * IssueDetail shows sync status badge
  * [x] Add inline editing to IssueDetail
    * Click-to-edit summary
    * Status dropdown with transitions
    * Edit button for description
  * [x] Mock JIRA timestamp tracking
    * Added `updated` timestamp tracking to `backend/app/services/mock_jira/router.py`

next:
* [ ] Phase 4: Board View
  * [ ] Implement Kanban board
  * [ ] Add drag-and-drop transitions
  * [ ] Implement quick filters
  * [ ] Add column customization 
