# HarBaat AI — Knowledge Orchestrator

> **Final Year Project · FAST-NUCES, Karachi Campus**

An enterprise-grade, multi-tenant workspace that transforms meeting recordings into structured, searchable knowledge using AI-powered transcription, speaker diarization, entity extraction, and an interactive knowledge graph.

---

## ✨ Feature Overview

### 🔐 Authentication & User Management
- **Secure Registration & Login** — JWT-based sessions via NextAuth.js v5
- **Email Verification** — Token-based verification (7-day expiry)
- **Password Reset** — Single-use reset tokens (1-hour expiry)
- **User Profiles** — Editable name, email, and avatar
- **Session Middleware** — Route protection with role-aware redirects

### 🏢 Multi-Tenancy & Teams
- **Team Workspaces** — Isolated, scoped environments per team
- **Role-Based Access Control (RBAC)** — Owner / Admin / Member roles with granular permissions
- **Team Management** — Invite, remove members; manage roles; delete team (Danger Zone)
- **Workspace Context** — Global React Context for active workspace switching

### 🎙️ Meeting Management
- **Audio Upload** — Drag-and-drop and file-browse UI; supports MP3, WAV, M4A, OGG (up to 100 MB)
- **Recording Consent Flow** — Mandatory consent prompt before upload
- **Real-time Processing Status** — Polling-based status tracker (uploading → transcribing → extracting → complete)
- **Meeting Library** — Card/list view with date, duration, speaker count, and status
- **Voice Recording** — In-browser microphone capture via `useVoiceRecorder`

### 📄 Transcript & Playback
- **Synchronized Audio Player** — Wavesurfer.js waveform synchronized with transcript segments
- **Speaker-labeled Segments** — Color-coded per speaker with timestamp navigation
- **Transcript Streaming** — Progressive rendering via `useTranscriptStream`
- **Smart Search** — Highlight matching terms, navigate results, show match count
- **Copy to Clipboard** — One-click export of transcript content

### 🧠 Entity Extraction & Knowledge Graph
- **Entities Panel** — Tasks (owner, deadline, status), Decisions, and Key Points
- **Timestamp Jump** — Click any entity to seek the audio/transcript to that moment
- **Interactive Knowledge Graph** — Cytoscape.js with multiple layout engines (Dagre, Cose, Grid)
- **Graph Controls** — Command bar for layout switching, zoom, export
- **Conflict Detection** — Highlighted conflict edges (red dotted lines) in the graph
- **Dark Mode Graph** — Node underlay glows, dark-first styling
- **Graph Detail Panel** — Click a node or edge for context and metadata

### 👥 Speaker Management
- **Speaker Diarization** — Automatic speaker identification from ASR output
- **Known Speakers** — Register voice profiles for identity linking
- **Voice Identity** — Record and submit speaker enrollment audio
- **Speaker Linking** — Link diarized speakers to known profiles

### 🔔 Notifications
- **In-app Notifications** — Badge counter with real-time mention alerts
- **Cross-user Mentions** — Trigger notification flows across team members

### 📁 Projects
- **Project Dashboard** — Meeting count, members, and recent activity
- **Project Knowledge Graph** — Aggregated graph across all project meetings
- **People View** — Per-person task tracking via `usePersonTasks`

### ⚙️ Settings
- **Profile Settings** — Update user information
- **Team Settings** — Manage team membership and roles
- **Danger Zone** — Irreversible team deletion with confirmation guard

---

## 🛠️ Tech Stack

### Frontend
| Technology | Role |
|---|---|
| **Next.js 16** (App Router) | React framework & routing |
| **React 19** | UI library |
| **TypeScript** | Static type safety |
| **Tailwind CSS v4** | Dark-first utility styling |
| **shadcn/ui + Radix UI** | Accessible UI primitives |
| **NextAuth.js v5** | Authentication & session management |
| **TanStack Query v5** | Server state, caching & deduplication |
| **Zustand** | Lightweight client state management |
| **Cytoscape.js + d3-force** | Knowledge graph visualization |
| **Wavesurfer.js** | Waveform audio playback |
| **Axios** | Typed HTTP client |
| **React Hook Form + Zod** | Form handling & validation |
| **Sonner** | Toast notification system |
| **Lucide React + React Icons** | Icon libraries |
| **next-themes** | Light/dark mode theming |
| **react-markdown + remark-gfm** | Markdown rendering |

### Backend
| Technology | Role |
|---|---|
| **FastAPI** | Python ASGI web framework |
| **Uvicorn** | High-performance ASGI server |
| **Pydantic** | Data validation & serialization |
| **aiofiles** | Async file I/O |
| **bcrypt** | Password hashing |
| **secrets** | Cryptographically secure token generation |

### Testing & Quality
| Technology | Role |
|---|---|
| **Jest 30** | Unit & component test runner |
| **React Testing Library** | User-centric component testing |
| **Playwright** | Cross-browser E2E test automation |
| **Prettier** | Code formatting |
| **ESLint** | Static code linting |
| **Husky + lint-staged** | Pre-commit quality gates |

---

## 📋 Prerequisites

- **Node.js** 18+
- **npm** 9+
- **Python** 3.8+

---

## 🚀 Getting Started

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Start the API server
python main.py
```

The API will be available at **`http://localhost:8000`**. Interactive docs: `http://localhost:8000/docs`.

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Configure environment
cp .env.example .env.local   # then fill in values (see below)

# 4. Start the development server
npm run dev
```

The app will be available at **`http://localhost:3000`**.

#### Required Environment Variables (`frontend/.env.local`)

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# NextAuth configuration
NEXTAUTH_SECRET=your-strong-secret-here
NEXTAUTH_URL=http://localhost:3000
```

#### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
FYP-Knowledge-Orchestrator/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── auth.py                 # Authentication endpoints & logic
│   ├── email_service.py        # Branded HTML email templates
│   ├── requirements.txt        # Python dependencies
│   └── uploads/                # Stored audio files (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── (auth)/         # Authentication pages (signin, signup, verify, reset)
│   │   │   ├── (dashboard)/    # Protected dashboard routes
│   │   │   │   ├── dashboard/  # Landing dashboard
│   │   │   │   ├── meetings/   # Meeting list & detail ([id]/) pages
│   │   │   │   ├── projects/   # Project dashboard & graph
│   │   │   │   ├── teams/      # Team management
│   │   │   │   ├── people/     # People & tasks view
│   │   │   │   ├── settings/   # App & team settings
│   │   │   │   └── profile/    # User profile
│   │   │   ├── api/            # Next.js Route Handlers
│   │   │   └── providers.tsx   # Root context providers
│   │   ├── components/
│   │   │   ├── auth/           # Login, signup, verify, reset forms
│   │   │   ├── meetings/       # MeetingCard, TranscriptViewer, EntitiesPanel
│   │   │   ├── graph/          # CytoscapeGraph, KnowledgeGraphViewer, GraphDetailPanel
│   │   │   ├── speakers/       # SpeakerCard, UnlinkedSpeakerPrompt, VoiceIdentity
│   │   │   ├── recording/      # VoiceRecorder UI
│   │   │   ├── projects/       # ProjectCard, ProjectGraph, MeetingCount
│   │   │   ├── teams/          # TeamMemberList, InviteForm, DangerZone
│   │   │   ├── conflicts/      # ConflictViewer
│   │   │   ├── landing/        # Landing page hero
│   │   │   ├── layout/         # Sidebar, Topbar, MobileMenu
│   │   │   └── ui/             # shadcn/ui primitives (Button, Dialog, Select…)
│   │   ├── contexts/
│   │   │   ├── WorkspaceContext.tsx   # Active team/project scope
│   │   │   └── MobileMenuContext.tsx  # Mobile navigation state
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useMeetings.ts
│   │   │   ├── useMeetingDetail.ts
│   │   │   ├── useMeetingStatus.ts
│   │   │   ├── useTranscriptStream.ts
│   │   │   ├── useKnowledgeGraph.ts
│   │   │   ├── useGraph.ts
│   │   │   ├── useConflicts.ts
│   │   │   ├── useSpeakers.ts
│   │   │   ├── useKnownSpeakers.ts
│   │   │   ├── useVoiceRecorder.ts
│   │   │   ├── useVoiceIdentity.ts
│   │   │   ├── useAudioVisualizer.ts
│   │   │   ├── useNotifications.ts
│   │   │   ├── useProjects.ts
│   │   │   ├── useTeams.ts
│   │   │   ├── usePersonTasks.ts
│   │   │   └── useMediaQuery.ts
│   │   ├── lib/
│   │   │   ├── api/            # Axios client, per-domain API modules
│   │   │   │   ├── client.ts   # Axios instance with auth interceptors
│   │   │   │   ├── meetings.ts
│   │   │   │   ├── speakers.ts
│   │   │   │   ├── projects.ts
│   │   │   │   ├── teams.ts
│   │   │   │   ├── knownSpeakers.ts
│   │   │   │   ├── conflicts.ts
│   │   │   │   └── graph.ts
│   │   │   ├── services/       # Domain service classes
│   │   │   ├── audio/          # Audio processing utilities
│   │   │   ├── config/         # Runtime configuration
│   │   │   ├── utils/          # Shared utility functions
│   │   │   └── constants.ts    # App-wide constants (colors, limits)
│   │   ├── providers/          # TanStack Query & theme providers
│   │   ├── types/              # TypeScript definitions
│   │   │   ├── index.ts        # Core domain types
│   │   │   ├── domain.types.ts
│   │   │   ├── generics.types.ts
│   │   │   └── chat.types.ts
│   │   ├── auth.ts             # NextAuth configuration
│   │   └── middleware.ts       # Route protection middleware
│   ├── tests/
│   │   ├── e2e/                # Playwright specifications
│   │   │   ├── auth.spec.ts
│   │   │   ├── meeting-analysis.spec.ts
│   │   │   ├── notifications.spec.ts
│   │   │   ├── voice-identity.spec.ts
│   │   │   ├── dashboard-projects.spec.ts
│   │   │   ├── settings.spec.ts
│   │   │   ├── teams.spec.ts
│   │   │   └── known-speakers.spec.ts
│   │   ├── fixtures/           # Sample audio files for E2E tests
│   │   └── global-setup.ts     # Shared auth state setup
│   ├── jest.config.ts
│   ├── jest.setup.ts
│   ├── playwright.config.ts
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── Docs/
│   ├── PRD.md                          # Product Requirements Document
│   ├── FRONTEND_API_REFERENCE.md       # Full API surface reference
│   ├── FRONTEND_TESTING_GUIDE.md       # Testing patterns & conventions
│   ├── FEATURE_COMPONENTS_GUIDE.MD     # Component usage guide
│   ├── DATABASE_IMPLEMENTATION_PLAN.md # DB migration plan
│   ├── IMPLEMENTATION_GAP_ANALYSIS.md  # Phase gap analysis
│   ├── team_feature_plan.md            # Team feature specification
│   └── Auth_Implementation.md          # Auth implementation notes
│
└── README.md
```

---

## 🎯 Usage Guide

### Authentication

| Step | Action |
|---|---|
| **Sign Up** | Navigate to `/auth/signup` → fill in name, email & password |
| **Verify Email** | Click the link sent to your inbox, or visit `/auth/verify-email?token=…` |
| **Sign In** | Navigate to `/auth/signin` |
| **Reset Password** | Click "Forgot password?" on the sign-in page → follow email link |
| **Profile** | Click avatar → Profile → edit name or email |

### Meeting Workflow

1. **Upload** — Drag & drop or browse for an audio file on the dashboard
2. **Consent** — Confirm the recording consent prompt
3. **Process** — Watch the real-time status tracker advance through pipeline stages
4. **Transcript** — Click the meeting card to open the synchronized transcript viewer
5. **Search** — Use the search bar to highlight and navigate matching terms
6. **Entities** — Review AI-extracted tasks, decisions, and key points
7. **Knowledge Graph** — Switch to the Graph tab for an interactive visual representation

### Team Management

1. Navigate to **Settings → Team**
2. Invite members by email and assign roles (Admin / Member)
3. Manage existing members via the member list
4. Use the **Danger Zone** to permanently delete the team

---

## 🔧 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Apply password reset |
| `POST` | `/api/auth/verify-email` | Verify email token |
| `POST` | `/api/auth/resend-verification` | Resend verification email |
| `GET` | `/api/auth/profile/{user_id}` | Fetch user profile |
| `PUT` | `/api/auth/profile/{user_id}` | Update user profile |

### Meetings

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/meetings/upload` | Upload audio file |
| `GET` | `/api/meetings` | List all meetings |
| `GET` | `/api/meetings/{id}` | Get meeting details |
| `GET` | `/api/meetings/{id}/transcript` | Get diarized transcript |
| `GET` | `/api/meetings/{id}/search?q=` | Search transcript |
| `GET` | `/api/meetings/{id}/entities` | Get extracted entities |
| `GET` | `/api/meetings/{id}/status` | Poll processing status |
| `POST` | `/api/meetings/{id}/mock-complete` | Simulate completion (dev only) |

---

## 🧪 Testing

HarBaat AI maintains a three-layer testing strategy.

### 1. Unit & Component Tests (Jest + React Testing Library)

Tests cover UI primitives, business logic, and custom hook state machines.

```bash
# Run all unit tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Coverage areas:**
- `useVoiceRecorder` — full state machine (idle → recording → reviewing → submitting)
- `useMeetings` — fetch, cache, and error states
- `Sidebar` — RBAC-driven navigation rendering
- `Button` — variant, size, and accessibility

### 2. End-to-End Tests (Playwright)

E2E tests run against the hosted staging backend at `https://asim-ai.duckdns.org`. A global setup step pre-authenticates and caches the session.

```bash
# Run all E2E tests (headless, all browsers)
npm run test:e2e

# Open Playwright UI mode (interactive runner)
npm run test:e2e:ui
```

**Covered flows:**

| Spec | Coverage |
|---|---|
| `auth.spec.ts` | Signup, email verification, login, session revocation |
| `meeting-analysis.spec.ts` | Upload audio, poll status, view transcript & entities |
| `notifications.spec.ts` | Cross-user mentions, badge counter, notification list |
| `voice-identity.spec.ts` | Speaker enrollment using fixture audio |
| `dashboard-projects.spec.ts` | Project creation, meeting count, graph view |
| `settings.spec.ts` | Profile update, team settings |
| `teams.spec.ts` | Team creation, member invite, role management |
| `known-speakers.spec.ts` | Known speaker registration and linking |

### 3. Code Quality

```bash
# Format entire codebase
npm run format

# Lint codebase
npm run lint
```

Husky pre-commit hooks run `lint-staged` to format and lint changed files automatically.

---

## ⚙️ Customization

### Supported Audio Formats

Edit `backend/main.py`:
```python
allowed_extensions = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
```

### Upload Size Limit

Edit `frontend/src/lib/constants.ts`:
```typescript
export const APP_CONFIG = {
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '104857600'), // 100 MB
};
```

### Speaker Colors

Edit `frontend/src/lib/constants.ts`:
```typescript
export const SPEAKER_COLORS = [
  '#1890ff', '#52c41a', '#fa8c16',
  '#eb2f96', '#722ed1', '#13c2c2',
] as const;
```

### Knowledge Graph Default Layout

Edit `frontend/src/components/graph/graphLayouts.ts` to change the default Cytoscape layout (dagre, cose, grid, breadthfirst, circle).

---

## 🔒 Security

| Feature | Details |
|---|---|
| **Password hashing** | bcrypt with salt rounds |
| **Token generation** | `secrets.token_urlsafe()` — cryptographically secure |
| **Email verification tokens** | 7-day expiry, single-use |
| **Password reset tokens** | 1-hour expiry, single-use |
| **Session management** | JWT via NextAuth.js, server-validated on every request |
| **Route protection** | Next.js middleware enforces authentication on all dashboard routes |
| **CORS** | Restricted origin allowlist on the FastAPI backend |

---

## 🐛 Troubleshooting

### CORS Errors
Ensure the backend runs on port `8000` and the frontend on port `3000`. If using a custom port, update the CORS origin list in `backend/main.py`.

### File Upload Fails
Verify the `backend/uploads/` directory exists and has write permissions — it is created automatically on first run.

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux / macOS
lsof -ti:8000 | xargs kill -9
```

### NextAuth / Session Issues
- Ensure `NEXTAUTH_SECRET` is set and consistent across restarts
- `NEXTAUTH_URL` must match the exact URL the app is served from
- Clearing browser cookies resolves stale session issues

### Token Expiry
- Email verification tokens expire after **7 days** — use the "Resend Verification" button
- Password reset tokens expire after **1 hour** — request a new reset if needed

### Playwright Tests Fail (browser binaries)
```bash
npx playwright install
```

---

## 📝 Roadmap

| Status | Item |
|---|---|
| ✅ | Audio upload with consent flow |
| ✅ | ASR + speaker diarization pipeline |
| ✅ | Synchronized transcript & audio playback |
| ✅ | Entity extraction (tasks, decisions, key points) |
| ✅ | Interactive knowledge graph (Cytoscape.js) |
| ✅ | User authentication & profile management |
| ✅ | Email verification & password reset |
| ✅ | Multi-tenancy with team workspaces |
| ✅ | RBAC (Owner / Admin / Member roles) |
| ✅ | Speaker identity registration & linking |
| ✅ | In-app notifications & mentions |
| ✅ | Project knowledge graph |
| ✅ | Danger Zone (team deletion) |
| ✅ | Dark mode with glassmorphism design |
| ✅ | Playwright E2E test suite (8 specs) |
| ✅ | Jest unit & hook test suite |
| ✅ | Husky pre-commit quality gates |
| ⬜ | Real-time transcription (WebSocket streaming) |
| ⬜ | Transcript export (PDF / Word) |
| ⬜ | Task management (mark complete, reassign) |
| ⬜ | Database persistence (currently in-memory / file-based) |
| ⬜ | OAuth providers (Google, GitHub) |
| ⬜ | Calendar integration |

---

## 👥 Team

| Name | Roll No | Responsibility |
|---|---|---|
| **Asim Majeed** | 22K-4535 | ASR Pipeline & Transcription |
| **Muhammad Muzammil** | 22K-4267 | Dashboard, Multi-Tenancy & LLM Integration |
| **Ayan Hasan** | 22K-4367 | Knowledge Graph & Entity Extraction |

---

## 📄 License

This project is part of the Final Year Project at **FAST-NUCES, Karachi Campus**.
