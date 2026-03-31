# Team & Organization Feature Plan
## AI Voice Knowledge Orchestrator

---

## Executive Summary

This document consolidates the existing architecture and maps out a concrete, phased plan to add **Team/Organization-based multi-tenancy** to HarBaat AI. The goal: teams collaborate on shared meeting projects without rebuilding what already works at the individual level.

---

## Current State (What We Have)

### Backend Architecture
| Layer | Current State |
|---|---|
| **Auth** | JWT-based, per-user. `get_current_verified_user` dependency used everywhere. |
| **Projects** | Users own projects. `Project.user_id` = FK to `users.id`. |
| **Meetings** | Scoped to user + project. `Meeting.user_id` is redundant but enforced. |
| **Conflicts** | Already project-scoped — `Conflict.project_id`. No user check needed. |
| **Known Speakers** | Scoped to `user_id`. Each user has their own speaker library. |
| **Knowledge Graph** | Neo4j, keyed by `meeting_id`. No ownership concept, just meeting data. |
| **RAG** | ChromaDB, scoped by `meeting_id` filter. Project-wide queries already supported. |

### Frontend Architecture
| Layer | Current State |
|---|---|
| **Session** | NextAuth JWT. Carries `accessToken`, `user` (id, name, email, email_verified). |
| **Sidebar** | Static nav. No workspace context. User info shown at bottom. |
| **Context** | Only `MobileMenuContext` exists. No workspace/team context. |
| **API Hooks** | All hooks pass session's `accessToken` via Bearer token. |
| **Types** | `User`, `Project`, `Meeting` etc. — all individual-centric. No `Team` type. |

---

## What Needs to Be Built

### The Core Idea
```
Organization (optional)
  └── Team (workspace)
        ├── TeamMember (user + role)
        └── Project (owned by team OR user)
              └── Meeting (inherits visibility)
```

A `Project` can be either:
- **Personal** (`team_id = NULL`) — current behavior, no change needed
- **Team** (`team_id = <team_id>`) — shared with all team members

---

## Phased Implementation Plan

---

## Phase 1 — Team Core (Backend + Minimal UI)

**Goal**: Teams can be created, and users can be invited and join them.  
**No dashboard changes yet.** No permission enforcement in meetings yet.

---

### Backend Changes

#### New Database Models (`app/database.py`)

```python
class Team(Base):
    __tablename__ = "teams"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)  # URL-safe name e.g. "acme-corp"
    description = Column(Text, nullable=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="team")


class TeamMember(Base):
    __tablename__ = "team_members"
    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(String, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False, default="member")
    # Roles: "owner", "admin", "member", "viewer"
    joined_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="members")
    user = relationship("User")


class TeamInvite(Base):
    __tablename__ = "team_invites"
    id = Column(String, primary_key=True)
    team_id = Column(String, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    email = Column(String, nullable=False)
    role = Column(String, nullable=False, default="member")
    invited_by = Column(String, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    accepted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### Modify `Project` model
```python
# Add to Project model:
team_id = Column(String, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True, index=True)
team = relationship("Team", back_populates="projects")
```

#### Migration SQL
```sql
-- Run these on existing database
CREATE TABLE teams (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    owner_id VARCHAR(255) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(255) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

CREATE TABLE team_invites (
    id VARCHAR(255) PRIMARY KEY,
    team_id VARCHAR(255) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    invited_by VARCHAR(255) NOT NULL REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE projects ADD COLUMN team_id VARCHAR(255) REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX idx_projects_team_id ON projects(team_id);
```

#### New `app/api/endpoints/teams.py`

```
POST   /api/teams              — Create a new team
GET    /api/teams              — List teams the user is a member of
GET    /api/teams/{team_id}    — Get team details + member list
PATCH  /api/teams/{team_id}    — Update team name/description (owner/admin)
DELETE /api/teams/{team_id}    — Delete team (owner only)

POST   /api/teams/{team_id}/invites              — Invite user by email
GET    /api/teams/{team_id}/invites              — List pending invites
DELETE /api/teams/{team_id}/invites/{invite_id}  — Revoke invite
POST   /api/teams/invites/accept                 — Accept invite (by token)

PATCH  /api/teams/{team_id}/members/{user_id}    — Change member role
DELETE /api/teams/{team_id}/members/{user_id}    — Remove member (or leave)
```

#### New Auth Utility (`utils/team_auth.py`)

```python
def get_team_member(team_id: str, user: User, db: Session) -> TeamMember:
    """Get membership record or raise 403."""

def require_team_role(min_role: str):
    """Dependency factory: Depends(require_team_role('admin'))"""

def can_access_project(project: Project, user: User, db: Session) -> bool:
    """True if personal project owned by user, or user is member of project's team."""
```

---

### New Schemas (`app/schemas.py`)

```python
class TeamCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

class TeamMemberResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    joined_at: str

class TeamResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str]
    owner_id: str
    member_count: int
    your_role: str  # Role of the requesting user
    created_at: str

class TeamDetailResponse(TeamResponse):
    members: List[TeamMemberResponse]

class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = "member"

class AcceptInviteRequest(BaseModel):
    token: str
```

---

### Frontend Changes (Phase 1)

#### New TypeScript Types (`src/types/index.ts`)

```typescript
export interface Team {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    owner_id: string;
    member_count: number;
    your_role: 'owner' | 'admin' | 'member' | 'viewer';
    created_at: string;
}

export interface TeamMember {
    user_id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joined_at: string;
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';
```

#### New Pages
- `/teams` — List all teams you belong to
- `/teams/create` — Create a new team
- `/teams/[slug]` — Team settings page (members, invites, danger zone)
- `/teams/invites/[token]` — Accept an invite (public page, auth redirect)

---

## Phase 2 — Workspace Switcher + Scoped Views

**Goal**: Sidebar shows workspace context. Projects/Meetings filter by selected workspace.

---

### Backend Changes

#### Modify `projects.py` — Add `team_id` filter
```python
# GET /api/projects
# Add optional query param: ?team_id=xxx  or  ?personal=true
# access_check: user is member of team, OR personal project owner

@router.get("")
def list_projects(
    team_id: Optional[str] = None,
    personal: bool = False,
    current_user = Depends(get_current_verified_user),
    db = Depends(get_db),
):
    if team_id:
        # Only return projects belonging to this team if user is a member
        ...
    elif personal:
        # Only return projects with team_id IS NULL owned by user
        ...
    else:
        # Return all accessible: personal + all team projects
        ...
```

#### Modify `meetings.py` — Honor team project access
The `verify_meeting_ownership` helper currently checks `Meeting.user_id == current_user.id`. This needs to be updated to also allow access if the meeting's project belongs to a team the user is a member of.

```python
# utils/helpers.py — update verify_meeting_ownership
def verify_meeting_ownership(meeting_id, user, db):
    meeting = db.query(Meeting).filter(Meeting.meeting_id == meeting_id).first()
    if not meeting:
        raise HTTPException(404, "Meeting not found")

    # Personal ownership
    if meeting.user_id == user.id:
        return meeting

    # Team access
    project = db.query(Project).filter(Project.id == meeting.project_id).first()
    if project and project.team_id:
        member = db.query(TeamMember).filter(
            TeamMember.team_id == project.team_id,
            TeamMember.user_id == user.id
        ).first()
        if member:
            return meeting

    raise HTTPException(403, "Access denied")
```

---

### Frontend Changes (Phase 2)

#### New `WorkspaceContext` (`src/contexts/WorkspaceContext.tsx`)

```typescript
interface WorkspaceContextType {
    // Current active workspace
    workspace: 'personal' | Team;
    setWorkspace: (ws: 'personal' | Team) => void;

    // Convenience
    isTeamWorkspace: boolean;
    activeTeamId: string | null;
    activeTeamRole: TeamRole | null;

    // Permission helpers
    can: (permission: Permission) => boolean;
}

// Permission type
type Permission =
    | 'upload_meeting'
    | 'delete_meeting'
    | 'delete_project'
    | 'manage_members'
    | 'manage_settings';
```

The `can()` helper maps permissions to roles:
| Permission | owner | admin | member | viewer |
|---|---|---|---|---|
| upload_meeting | ✅ | ✅ | ✅ | ❌ |
| delete_meeting | ✅ | ✅ | own only | ❌ |
| delete_project | ✅ | ✅ | ❌ | ❌ |
| manage_members | ✅ | ✅ | ❌ | ❌ |
| manage_settings | ✅ | ❌ | ❌ | ❌ |

#### Workspace Switcher in Sidebar

Replace the current static "Workspace" label section in `Sidebar.tsx` with a dropdown:

```
┌──────────────────────────┐
│  HarBaat AI              │
├──────────────────────────┤
│ ▼  Personal Workspace    │ ← Dropdown trigger
│    ─────────────────     │
│    Acme Corp             │
│    My Startup Team       │
│    + Create or join team │
├──────────────────────────┤
│  [+] New meeting         │
├──────────────────────────┤
│  Dashboard               │
│  All Meetings            │
│  Projects                │
│  ─────────────────────── │
│  Settings                │
│  Known Speakers          │
├──────────────────────────┤
│  [Avatar] John Doe       │ ← User menu (unchanged)
└──────────────────────────┘
```

The workspace switcher persists selection in `localStorage` (key: `harbaat_active_workspace`).

#### Hook Updates

```typescript
// useProjects.ts — consume workspace context
const { activeTeamId } = useWorkspace();
const projects = useQuery(['projects', activeTeamId], () =>
    activeTeamId
        ? fetchTeamProjects(activeTeamId)
        : fetchPersonalProjects()
);

// useMeetings.ts — same pattern
```

---

## Phase 3 — Role-Based UI Gating

**Goal**: Show/hide UI actions based on the user's role in the current workspace.

This is **purely frontend** work since the session/context already carries role info by Phase 2.

```typescript
// Example usage in any component
const { can } = useWorkspace();

// Hide upload button for viewers
{can('upload_meeting') && <Button>New Meeting</Button>}

// Conditional delete on meeting cards
{can('delete_meeting') && <DeleteButton meeting={meeting} />}
```

> [!NOTE]
> The backend already enforces ownership — so even if a bug in the UI shows a button it shouldn't, the backend will reject the unauthorized request. Frontend gating is UX polish, not a security boundary.

---

## Phase 4 — Team-Specific Features

**Goal**: Features that only make sense in a team context.

### 4a. Shared Known Speakers

Currently `KnownSpeaker.user_id` ties speakers to one user. In a team, speaker libraries should be shared.

**Backend**: Add `team_id` (nullable) to `known_speakers`. API filters by `user_id OR team_id`.

**Frontend**: In the Known Speakers settings page, show "Team Speakers" as a separate section when in a team workspace.

### 4b. Team-Level Conflict Detection

The backend already handles cross-meeting conflict detection per project. The key enhancement is **cross-project** conflict detection within a team.

**Backend**: New `POST /api/teams/{team_id}/conflicts/scan` endpoint that runs conflict detection across all projects in the team.

### 4c. Team Dashboard / Analytics

When a team workspace is active, the dashboard shows:
- Total meetings uploaded by all team members this month
- Active speakers (from shared known speakers)
- Unresolved conflicts across all team projects
- A "Members Activity" feed (who uploaded what, recently)

---

## Implementation Priority & Effort

| Phase | Backend Effort | Frontend Effort | Priority |
|---|---|---|---|
| **P1: Team Core** | High (new models + CRUD) | Medium (3-4 new pages) | 🔴 Must First |
| **P2: Workspace Switcher** | Medium (filter params) | High (WorkspaceContext + Sidebar) | 🔴 Core Feature |
| **P3: Role Gating** | None | Low (context + conditionals) | 🟡 Once P2 is done |
| **P4a: Shared Speakers** | Low (add team_id) | Low (section in Settings) | 🟢 Nice to Have |
| **P4b: Cross-Project Conflicts** | Medium | Low | 🟢 Nice to Have |
| **P4c: Team Dashboard** | Medium | High | 🟢 Future Sprint |

---

## What Does NOT Change

> [!TIP]
> The following require zero changes, even in team mode:
> - **Meeting detail page** — transcript, RAG chat, action items. These work on `meeting_id` — team access just needs to be permitted upstream.
> - **Knowledge Graph viewer** — reads from Neo4j by `meeting_id`, no ownership concept.
> - **Conflict detection logic** — already project-scoped.
> - **ASR/LLM pipeline** — processes `meeting_id`, doesn't know about teams.
> - **ChromaDB RAG** — already supports `project_id` filters.

---

## Key Design Decisions

> [!IMPORTANT]
> **Decision 1: Slugs for Teams**
> Using URL-safe slugs (`/teams/acme-corp`) instead of raw UUIDs makes team pages bookmarkable and readable. Enforce uniqueness at DB level.

> [!IMPORTANT]
> **Decision 2: Personal Projects Stay Unchanged**
> `team_id = NULL` means personal project — existing code paths unchanged. No migration needed for existing data.

> [!IMPORTANT]
> **Decision 3: Workspace Persisted in localStorage, not session**
> Putting workspace selection in the JWT would require re-login every team switch. localStorage is simpler, more responsive, and matches how Slack, Linear, and Vercel handle it.

> [!WARNING]
> **Breaking Change: `verify_meeting_ownership`**
> This utility currently hard-checks `Meeting.user_id == user.id`. Phase 2 changes this to allow team-based access. This must be done carefully with thorough testing to avoid accidentally exposing meetings across teams.

---

## File Map (Summary of all changes per file)

### Backend
| File | Change |
|---|---|
| `app/database.py` | Add `Team`, `TeamMember`, `TeamInvite` models; modify `Project` |
| `schema.sql` | Add 3 new tables + `projects.team_id` column |
| `app/schemas.py` | Add Team-related Pydantic schemas |
| `app/api/endpoints/teams.py` | **[NEW]** Full team CRUD + invite system |
| `app/api/endpoints/projects.py` | Add `team_id` and `personal` query params |
| `app/main.py` | Register teams router |
| `utils/helpers.py` | Update `verify_meeting_ownership` for team access |
| `utils/team_auth.py` | **[NEW]** Team permission utilities |

### Frontend
| File | Change |
|---|---|
| `src/types/index.ts` | Add `Team`, `TeamMember`, `TeamRole` types |
| `src/contexts/WorkspaceContext.tsx` | **[NEW]** Active workspace + `can()` permissions |
| `src/lib/api/teams.ts` | **[NEW]** API client for teams |
| `src/lib/config/endpoints.config.ts` | Add teams endpoints |
| `src/components/layout/Sidebar.tsx` | Add workspace switcher dropdown |
| `src/app/(dashboard)/teams/page.tsx` | **[NEW]** List teams |
| `src/app/(dashboard)/teams/create/page.tsx` | **[NEW]** Create team form |
| `src/app/(dashboard)/teams/[slug]/page.tsx` | **[NEW]** Team settings + members |
| `src/app/(auth)/invite/[token]/page.tsx` | **[NEW]** Accept invite page |
| `src/hooks/useProjects.ts` | Consume workspace context for filtered fetches |
| `src/hooks/useMeetings.ts` | Same |
