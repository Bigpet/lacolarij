# Dummy Login Feature - Design Document

**Issue:** #18
**Created:** 2026-01-12
**Status:** Proposal/Mockup for Review

## Problem Statement

Currently, new users must register an account before they can explore JiraLocal. This creates friction for users who just want to try out the application without committing to creating credentials. We need a "Try Demo" or "Demo Login" option that allows instant access to a pre-configured demo environment.

## Goals

1. **Reduce friction**: Enable users to try the app immediately without registration
2. **Showcase features**: Pre-populate the demo with sample data so users can see the app in action
3. **Maintain existing flow**: Keep registration for users who want persistent accounts
4. **Security**: Ensure demo mode doesn't create security risks

## Proposed Solution

### UI Changes

#### Login Page Mockup

Add a "Try Demo" button to the login page alongside the existing "Sign in" button:

```
┌─────────────────────────────────────────┐
│                                         │
│         Welcome back                    │
│   Enter your credentials to access     │
│           your account                  │
│                                         │
│   Username: ________________            │
│                                         │
│   Password: ________________            │
│                                         │
│   ┌───────────────────────────┐        │
│   │       Sign in             │        │
│   └───────────────────────────┘        │
│                                         │
│   ┌───────────────────────────┐        │
│   │  🎯 Try Demo (No signup)  │        │
│   └───────────────────────────┘        │
│                                         │
│   Don't have an account? Sign up       │
│                                         │
└─────────────────────────────────────────┘
```

**Visual Design:**
- Demo button uses `variant="outline"` to distinguish from primary action
- Icon (🎯 or similar) makes it visually distinct
- Placed between login button and sign-up link
- Clear text: "Try Demo (No signup)" or "Try Demo Mode"

### Backend Implementation

#### 1. Create Demo User on Startup

**File:** `backend/app/db/database.py` or new `backend/app/services/demo_user.py`

Create a system demo user when the application starts:
- Username: `demo_user` (or configurable via env var)
- Password: `demo` (or configurable via env var)
- Created automatically if it doesn't exist
- Cannot be deleted through normal user management

```python
DEMO_USERNAME = "demo_user"
DEMO_PASSWORD = "demo"

async def ensure_demo_user_exists(db: AsyncSession) -> None:
    """Create demo user if it doesn't exist."""
    # Check if demo user exists
    # If not, create with hashed password
    # Auto-create demo JIRA connection
```

#### 2. Auto-Configure Demo JIRA Connection

When demo user logs in for the first time (or on every login), ensure they have a JIRA connection configured:
- Name: "Demo JIRA Server"
- URL: `demo://local` (special URL that routes to mock JIRA)
- Credentials: Not needed for mock JIRA
- Pre-configured as default connection

#### 3. Seed Demo Data

**File:** `backend/app/services/demo_data.py`

Create sample issues in the mock JIRA server for demo users:
- 5-10 sample issues across different statuses (To Do, In Progress, Done)
- Variety of issue types (Task, Bug, Story)
- Some with descriptions, comments, labels
- Demonstrates key features: board view, sync, editing, etc.

**Sample Issues:**
1. `TEST-1`: "Set up development environment" - Done
2. `TEST-2`: "Implement user authentication" - Done
3. `TEST-3`: "Build issue list view" - In Progress
4. `TEST-4`: "Add drag-and-drop board" - In Progress
5. `TEST-5`: "Implement offline mode" - To Do
6. `TEST-6`: "Add full-text search" - To Do
7. `TEST-7`: "Fix sync conflict bug" - To Do (Bug)

#### 4. Demo Login Endpoint

**Option A: New endpoint** (Recommended)
```python
@router.post("/auth/demo-login")
async def demo_login() -> dict:
    """Login as demo user without credentials."""
    # Authenticate as demo user
    # Return JWT token
    # Optionally: reset demo data on each login for fresh experience
```

**Option B: Modify existing login**
- Client sends special credentials
- Server recognizes and auto-authenticates

**Recommendation:** Option A is cleaner and more explicit.

### Frontend Implementation

#### 1. Update LoginPage Component

**File:** `frontend/src/features/auth/LoginPage.tsx`

Add demo login handler and button:

```tsx
const handleDemoLogin = async () => {
  clearError();
  try {
    await loginAsDemo(); // New auth store action
    navigate('/');
  } catch {
    // Error handled by store
  }
};

// In JSX, after the Sign In button:
<Button
  type="button"
  variant="outline"
  className="w-full"
  onClick={handleDemoLogin}
  disabled={isLoading}
>
  🎯 Try Demo (No signup)
</Button>
```

#### 2. Update Auth Store

**File:** `frontend/src/stores/authStore.ts`

Add new action:

```tsx
loginAsDemo: async () => {
  set({ isLoading: true, error: null });
  try {
    const response = await api.demoLogin();
    const token = response.access_token;

    apiClient.setToken(token);
    set({ token });

    // Fetch user info
    const user = await api.getCurrentUser();
    set({ user, isLoading: false });
  } catch (error) {
    set({
      error: 'Failed to start demo mode',
      isLoading: false
    });
    throw error;
  }
}
```

#### 3. Update API Client

**File:** `frontend/src/lib/api.ts`

Add new endpoint:

```tsx
async demoLogin() {
  const response = await this.client.post('/api/auth/demo-login');
  return response.data;
}
```

#### 4. Demo Mode Indicator (Optional Enhancement)

Add a subtle indicator when logged in as demo user:
- Small badge in header/settings: "Demo Mode"
- Info message on settings page explaining demo limitations
- Optionally: banner suggesting registration to save work

### Data Management

#### Demo Data Reset Strategy

**Option 1: Per-Session Isolation (Recommended)**
- Each demo login gets a fresh isolated environment
- Use session-specific storage key for mock JIRA data
- Data cleared on logout or after timeout

**Option 2: Shared Demo State**
- All demo users share the same mock JIRA instance
- Data persists across sessions
- Periodic reset (e.g., daily, or manual)

**Option 3: Copy-on-Write**
- Demo starts with seed data
- Changes are session-specific
- Fresh users see original seed data

**Recommendation:** Option 1 for best first-time experience.

#### Implementation Notes

1. **Session Management:**
   - Generate unique session ID for each demo login
   - Store demo data in memory with session key
   - Clean up old sessions after timeout (e.g., 1 hour)

2. **Storage:**
   ```python
   # In mock_jira/router.py
   _demo_sessions: dict[str, dict[str, Issue]] = {}

   def get_demo_storage(session_id: str) -> dict:
       if session_id not in _demo_sessions:
           _demo_sessions[session_id] = create_seed_data()
       return _demo_sessions[session_id]
   ```

3. **Session Cleanup:**
   - Background task to remove sessions older than 1 hour
   - Or: use TTL cache (e.g., cachetools)

### E2E Testing

Update test fixtures to include demo login:

**File:** `frontend/e2e/fixtures/auth.ts`

```tsx
export const DEMO_USER: TestUser = {
  username: 'demo_user',
  password: 'demo',
  email: 'demo@example.com',
};

export async function loginAsDemo(
  page: Page,
  request: APIRequestContext
): Promise<void> {
  const response = await request.post(`${BACKEND_URL}/api/auth/demo-login`);
  const data = await response.json();
  await setAuthStateInBrowser(page, data.access_token, DEMO_USER.username);
}
```

**New Test:** `frontend/e2e/tests/auth/demo-login.spec.ts`
- Test demo login flow
- Verify pre-seeded data exists
- Verify demo JIRA connection is configured
- Verify CRUD operations work in demo mode

### Configuration

Environment variables:

```bash
# .env
DEMO_USER_USERNAME=demo_user
DEMO_USER_PASSWORD=demo
DEMO_SESSION_TIMEOUT_MINUTES=60
```

### Security Considerations

1. **Rate Limiting:**
   - Limit demo login requests to prevent abuse
   - E.g., max 10 demo sessions per IP per hour

2. **Data Isolation:**
   - Demo data must be completely isolated from real user data
   - No access to actual JIRA instances

3. **Session Security:**
   - Demo sessions have limited lifetime
   - Cannot modify demo user credentials
   - Cannot add real JIRA connections (optional: allow but don't persist)

4. **Resource Limits:**
   - Limit number of concurrent demo sessions
   - Clean up old sessions to prevent memory leaks
   - Consider max storage per demo session

### Migration Path

1. **Phase 1: Basic Demo Login**
   - Add demo login button to UI
   - Create demo user backend
   - Auto-configure demo JIRA connection
   - Use existing mock JIRA (empty initially)

2. **Phase 2: Seed Data**
   - Create demo data seeding service
   - Add sample issues on demo login
   - Test with users for feedback

3. **Phase 3: Session Isolation**
   - Implement per-session storage
   - Add session cleanup
   - Add demo mode indicators

4. **Phase 4: Polish**
   - Add "Save Your Work" prompts suggesting registration
   - Analytics on demo user behavior
   - A/B testing on button copy/placement

### Open Questions

1. **Should demo users be able to register while staying in demo mode?**
   - Option A: Add "Save Your Work" button that converts demo → registration
   - Option B: Separate flows, user must logout and register normally

2. **Should demo data reset on every login or persist during session?**
   - Recommendation: Fresh seed data on each demo login

3. **Should we show a tutorial/onboarding for demo users?**
   - Could add a guided tour using a library like `react-joyride`
   - Show key features: create issue, board view, sync, offline mode

4. **Should demo mode allow real JIRA connections?**
   - Probably not - defeats the purpose and adds complexity
   - Keep demo mode strictly for mock JIRA

5. **Button text options:**
   - "Try Demo (No signup)" ← Clear and direct
   - "Try Demo Mode"
   - "Quick Demo"
   - "Explore Demo"
   - "Try Without Signing Up"

## Success Metrics

- % of new users who try demo before registering
- Demo → Registration conversion rate
- Time spent in demo mode
- Features used in demo mode (indicates what's valuable)

## Alternative Approaches Considered

### Alternative 1: Anonymous Mode
- No login at all, just "Continue as Guest"
- **Pros:** Even less friction
- **Cons:** No way to save work, harder to implement persistence

### Alternative 2: Pre-filled Credentials
- Login page has "Use demo credentials" link that fills in demo/demo
- **Pros:** Simpler, reuses existing login flow
- **Cons:** Users still see a form, feels like more steps

### Alternative 3: Separate Demo Landing Page
- `/demo` route with instant access, no login page
- **Pros:** Completely frictionless
- **Cons:** Harder to convert to real users, SEO issues

**Recommendation:** Proceed with proposed "Try Demo" button approach.

## Implementation Checklist

### Backend
- [ ] Create demo user initialization service
- [ ] Add `/api/auth/demo-login` endpoint
- [ ] Create demo data seeding service
- [ ] Implement session-based demo storage
- [ ] Add session cleanup background task
- [ ] Add rate limiting for demo endpoint
- [ ] Add environment configuration

### Frontend
- [ ] Update `LoginPage.tsx` with demo button
- [ ] Add `loginAsDemo()` to auth store
- [ ] Add `demoLogin()` to API client
- [ ] Add demo mode indicator (optional)
- [ ] Update routing to handle demo sessions

### Testing
- [ ] Add E2E test for demo login flow
- [ ] Add E2E test for demo data seed
- [ ] Add unit tests for demo services
- [ ] Test session cleanup
- [ ] Test rate limiting

### Documentation
- [ ] Update README with demo mode info
- [ ] Add demo mode to architecture docs
- [ ] Document environment variables

## Timeline Estimate

- **Phase 1 (Basic):** 4-6 hours
- **Phase 2 (Seed Data):** 2-3 hours
- **Phase 3 (Session Isolation):** 3-4 hours
- **Phase 4 (Polish):** 2-3 hours

**Total:** ~11-16 hours of development

Can be done incrementally, with Phase 1 providing immediate value.

## Questions for Review

1. Do you prefer per-session isolation or shared demo state?
2. Should demo users see a banner/indicator that they're in demo mode?
3. What button text do you prefer for the demo login?
4. Should we add any tutorial/onboarding for demo users?
5. Any specific seed data you'd like in the demo (e.g., specific issue types, workflows)?
