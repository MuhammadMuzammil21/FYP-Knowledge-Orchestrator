# Product Requirements Document (PRD)
## AI Meeting Knowledge Orchestrator - User Dashboard MVP

## 1. Overview
**Product:** User-facing web dashboard for the AI Meeting Knowledge Orchestrator  
**Purpose:** Provide a minimal viable interface for users to upload meeting recordings, view transcriptions, search content, and access extracted knowledge  
**Timeline:** MVP Phase (Current Cycle) - Basic functionality; Refinement in future optimization cycles  
**Tech Stack:** Next.js (Frontend) + FastAPI (Backend)

## 2. Core User Flows

### 2.1 Primary User Journey
1. User uploads audio file of meeting
2. System processes audio (ASR + diarization + extraction)
3. User views transcript with speaker labels
4. User searches transcript content
5. User views extracted structured data (tasks, decisions, owners)

## 3. MVP Features (Must Have)

### 3.1 Audio Upload Interface
**What you need:**
- File upload component (drag-and-drop + browse button)
- Accepted formats: .mp3, .wav, .m4a, .ogg
- File size limit indicator (e.g., max 100MB)
- Upload progress bar
- Basic validation (file type, size)

**UI Elements:**
```
┌─────────────────────────────────┐
│   📁 Upload Meeting Recording   │
│                                 │
│   Drag & drop or click to      │
│   browse files                  │
│                                 │
│   Supported: MP3, WAV, M4A      │
│   Max size: 100MB               │
└─────────────────────────────────┘
```

### 3.2 Processing Status Display
**What you need:**
- Processing status indicator with stages:
  - "Uploading..."
  - "Transcribing..." (with approximate time estimate)
  - "Extracting entities..."
  - "Building knowledge graph..."
  - "Complete ✓"
- Error state handling with user-friendly messages
- Ability to cancel processing (optional for MVP)

**UI Elements:**
```
Processing Status: Transcribing... (2 min remaining)
[████████████────────────] 60%
```

### 3.3 Meeting List/Library View
**What you need:**
- Table or card layout showing all processed meetings
- Display fields per meeting:
  - Meeting title (auto-generated or user-provided)
  - Upload date & time
  - Duration
  - Status (Processing/Complete/Failed)
  - Number of participants (speakers)
- Click to view full transcript
- Basic sorting (by date, newest first)

**UI Elements:**
```
┌──────────────────────────────────────────────────────┐
│ My Meetings                                     [+]  │
├──────────────────────────────────────────────────────┤
│ Q3 Planning Session          Oct 15, 2025  45 min   │
│ 3 speakers | Complete                               │
├──────────────────────────────────────────────────────┤
│ Client Feedback Call         Oct 12, 2025  28 min   │
│ 2 speakers | Complete                               │
└──────────────────────────────────────────────────────┘
```

### 3.4 Transcript Viewer
**What you need:**
- Full transcript display with:
  - Speaker labels (Speaker 1, Speaker 2, etc.)
  - Timestamps for each speaker segment
  - Text content (with proper line breaks)
  - Basic formatting (speaker names bold/colored)
  - Scrollable view for long transcripts
  - Copy-to-clipboard functionality

**UI Elements:**
```
┌─────────────────────────────────────────────────┐
│ Q3 Planning Session - Transcript               │
├─────────────────────────────────────────────────┤
│ [00:00:15] Speaker 1:                          │
│ Let's start with the Q3 targets. Hamein        │
│ revenue goal achieve karna hai...              │
│                                                 │
│ [00:00:45] Speaker 2:                          │
│ I think we should focus on client retention... │
└─────────────────────────────────────────────────┘
```

### 3.5 Search Functionality
**What you need:**
- Search bar at top of transcript view
- Real-time/on-submit text search within transcript
- Highlight matching text in transcript
- Show count of matches (e.g., "5 results")
- Jump to next/previous match buttons
- Basic search (exact phrase initially; fuzzy search can come later)

**UI Elements:**
```
┌─────────────────────────────────────────────────┐
│ 🔍 Search transcript...          [5 results]   │
│                                   ↑ ↓          │
└─────────────────────────────────────────────────┘
```

### 3.6 Extracted Entities Display
**What you need:**
- Dedicated section/panel showing structured data:

**Tasks:**
- Task description
- Assigned owner
- Deadline (if mentioned)
- Status (default: Pending)

**Decisions:**
- Decision statement
- Who made it (speaker)
- Timestamp in meeting

**Key Points:**
- Important discussion points
- Context/summary
- Simple card or list layout
- Link to relevant transcript timestamp (click to jump)

**UI Elements:**
```
┌─────────────────────────────────────────────────┐
│ 📋 Tasks (3)                                    │
├─────────────────────────────────────────────────┤
│ □ Follow up with client regarding proposal     │
│   Owner: Speaker 2 | Deadline: Oct 20          │
│   [Jump to 00:15:30]                           │
├─────────────────────────────────────────────────┤
│ □ Prepare Q4 budget draft                      │
│   Owner: Speaker 1 | Deadline: Nov 1           │
│   [Jump to 00:28:45]                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ✓ Decisions (2)                                 │
├─────────────────────────────────────────────────┤
│ Approved marketing budget increase of 15%      │
│ Decided by: Speaker 1 | [00:12:20]            │
└─────────────────────────────────────────────────┘
```

## 4. Backend API Requirements

### 4.1 Core Endpoints You Need

**POST /api/meetings/upload**
- Accept multipart/form-data audio file
- Return meeting_id, status

**GET /api/meetings**
- Return list of all meetings with metadata

**GET /api/meetings/{meeting_id}**
- Return full meeting details (transcript, entities, metadata)

**GET /api/meetings/{meeting_id}/transcript**
- Return formatted transcript with speakers + timestamps

**GET /api/meetings/{meeting_id}/search?q={query}**
- Return search results with highlighted snippets

**GET /api/meetings/{meeting_id}/entities**
- Return extracted tasks, decisions, key points

**GET /api/meetings/{meeting_id}/status**
- Return current processing status (for polling)

## 5. Data Models (Frontend State)

### 5.1 Meeting Object
```typescript
{
  id: "uuid",
  title: "Q3 Planning Session",
  uploadDate: "2025-10-15T10:30:00Z",
  duration: 2700, // seconds
  status: "complete", // processing | complete | failed
  speakerCount: 3,
  audioUrl: "/uploads/audio/uuid.mp3"
}
```

### 5.2 Transcript Object
```typescript
{
  meetingId: "uuid",
  segments: [
    {
      speaker: "Speaker 1",
      timestamp: 15.5, // seconds
      text: "Let's start with the Q3 targets..."
    }
  ]
}
```

### 5.3 Entity Object
```typescript
{
  tasks: [
    {
      id: "task_uuid",
      description: "Follow up with client",
      owner: "Speaker 2",
      deadline: "2025-10-20",
      status: "pending",
      timestamp: 930.5 // link to transcript
    }
  ],
  decisions: [
    {
      id: "decision_uuid",
      statement: "Approved 15% budget increase",
      decidedBy: "Speaker 1",
      timestamp: 740.2
    }
  ],
  keyPoints: [
    {
      id: "keypoint_uuid",
      point: "Q3 revenue goals need to be achieved",
      timestamp: 15.5
    }
  ]
}
```

## 6. UI/UX Wireframe Priority

**Phase 1 (Current MVP):**
- ✅ Upload page
- ✅ Meeting list
- ✅ Basic transcript viewer
- ✅ Simple search (text highlight)
- ✅ Entity cards display

**Phase 2 (Future Refinement):**
- Audio playback synchronized with transcript
- Advanced search filters
- Task management (mark complete, reassign)
- Export functionality (PDF, Word)
- Meeting comparison view
- Natural language query interface

## 7. Technical Implementation Notes

### 7.1 Next.js App Router Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (meeting list)
│   ├── upload/
│   │   └── page.tsx            # Upload page
│   ├── meetings/
│   │   └── [id]/
│   │       └── page.tsx        # Meeting detail page
│   └── globals.css             # Global styles
├── components/
│   ├── upload/
│   │   └── UploadForm.tsx      # Client component for file upload
│   ├── meetings/
│   │   ├── MeetingList.tsx      # Server/Client component
│   │   ├── MeetingCard.tsx     # Meeting card component
│   │   └── TranscriptViewer.tsx # Client component
│   ├── search/
│   │   └── SearchBar.tsx       # Client component
│   ├── entities/
│   │   └── EntityPanel.tsx     # Client component
│   └── status/
│       └── StatusIndicator.tsx # Client component
├── lib/
│   ├── api/
│   │   └── client.ts           # API client functions
│   └── hooks/
│       ├── useMeetings.ts      # Custom hooks for data fetching
│       └── useTranscript.ts    # Custom hooks for transcript
└── types/
    └── index.ts                # TypeScript type definitions
```

### 7.2 Next.js Architecture Patterns

**Server Components (Default):**
- Use Server Components for data fetching and initial rendering
- Meeting list page can be a Server Component that fetches data
- No client-side JavaScript needed for static content

**Client Components:**
- Mark interactive components with `'use client'` directive
- Use for: file uploads, search functionality, status polling, interactive UI elements
- Examples: `UploadForm.tsx`, `SearchBar.tsx`, `StatusIndicator.tsx`

**Data Fetching:**
- Use `async/await` in Server Components for initial data
- Use `fetch` with Next.js caching and revalidation
- Use React Server Actions for mutations (file uploads)
- Use custom hooks (`useMeetings`, `useTranscript`) for client-side data fetching and polling

**Routing:**
- App Router file-based routing
- Dynamic routes: `app/meetings/[id]/page.tsx`
- Route groups for organization if needed

### 7.3 State Management
- **Server State:** Use Server Components and React Server Actions for server-side state
- **Client State:** Use React hooks (`useState`, `useReducer`) for local component state
- **Global Client State:** Use React Context API or Zustand for shared client state
  - Store: current meeting, search results, UI state
  - Minimal setup for MVP; can upgrade to more complex solutions later
- **Server Actions:** Use for form submissions and mutations (file uploads)

### 7.4 Styling Approach
- **Option 1:** Tailwind CSS (recommended for MVP speed)
  - Already configured in Next.js project
  - Fast prototyping and consistent design
- **Option 2:** Component library (shadcn/ui, Material-UI, or Ant Design)
  - Pre-built components for faster development
  - shadcn/ui works well with Tailwind CSS
- **Recommendation:** Use Tailwind CSS + shadcn/ui for MVP speed and flexibility

### 7.5 API Integration
- Create API client in `src/lib/api/client.ts`
- Use environment variables for API base URL (`NEXT_PUBLIC_API_URL`)
- Implement error handling and retry logic
- Use React Query or SWR for client-side data fetching and caching (optional for MVP)

## 8. Success Criteria for MVP
Your dashboard MVP is complete when:
- ✅ User can upload audio and see processing status
- ✅ User can view list of all meetings
- ✅ User can open and read full transcript with speakers
- ✅ User can search within transcript and see highlights
- ✅ User can view extracted tasks, decisions, and key points
- ✅ Basic error handling works (file too large, processing failed)
- ✅ Application runs locally on your RTX 3050 machine

## 9. Out of Scope (For Later Cycles)
- Real-time audio playback with transcript sync
- User authentication/multi-user support
- Meeting editing/deletion
- Advanced analytics dashboard
- Mobile responsive design (can be basic for MVP)
- Integration with calendar systems
- Email notifications for tasks
- Collaboration features (comments, sharing)

## 10. Development Workflow Suggestion

**Week 1-2: Setup & Upload**
- Set up Next.js + FastAPI project structure
- Configure Tailwind CSS and project structure
- Build upload form with file validation (Client Component)
- Create React Server Action for file upload
- Create basic FastAPI endpoint for file upload
- Test end-to-end upload flow

**Week 3: Transcript Display**
- Design transcript viewer component (Client Component)
- Create Server Component for meeting detail page
- Fetch transcript from backend using Server Component or custom hook
- Implement speaker labels and timestamps
- Add copy functionality

**Week 4: Search & Entities**
- Build search bar component (Client Component)
- Implement text highlighting with client-side state
- Create entity display cards (Client Component)
- Link entities to transcript timestamps
- Implement navigation between sections

**Week 5: Polish**
- Add meeting list view (Server Component with data fetching)
- Implement status polling for processing meetings
- Improve error handling and loading states
- Style consistency check
- User testing with sample meetings

## 11. Quick Start Checklist

**Before You Code:**
- [ ] Install Node.js + npm/yarn
- [ ] Install Python + FastAPI dependencies
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up project structure (app router)
- [ ] Choose component library (Tailwind + shadcn/ui recommended)
- [ ] Set up API base URL configuration (`NEXT_PUBLIC_API_URL`)

**First Components to Build:**
1. **UploadForm** (Client Component) - file input + React Server Action for submission
2. **MeetingList** (Server Component) - fetch and display meetings
3. **MeetingCard** (Client Component) - individual meeting card
4. **TranscriptViewer** (Client Component) - text display with speakers
5. **SearchBar** (Client Component) - input + highlight logic
6. **EntityPanel** (Client Component) - tasks/decisions/key points display

**Key Next.js Concepts to Use:**
- Server Components for initial data fetching
- Client Components (`'use client'`) for interactivity
- React Server Actions for form submissions
- Custom hooks for client-side data fetching and polling
- Dynamic routes for meeting detail pages
- Environment variables for API configuration

