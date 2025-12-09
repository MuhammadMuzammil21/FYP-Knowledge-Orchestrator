# Frontend API Reference

> **Base URL**: `http://localhost:8000`  
> **Last Updated**: December 9, 2025

This document provides complete API documentation for frontend developers to build a web application consuming the AI Meeting Knowledge Orchestrator API.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Meeting Upload & Metadata](#2-meeting-upload--metadata)
3. [Meeting Status & Polling](#3-meeting-status--polling)
4. [Transcripts](#4-transcripts)
5. [Speakers Management](#5-speakers-management)
6. [Projects](#6-projects)
7. [Conflicts](#7-conflicts)
8. [Knowledge Extraction (Entities)](#8-knowledge-extraction-entities)
9. [Knowledge Graph](#9-knowledge-graph)
10. [RAG (AI Search)](#10-rag-ai-search)
11. [Known Speakers](#11-known-speakers)
12. [User Profile](#12-user-profile)
13. [Response Status Codes](#13-response-status-codes)
14. [UI Implementation Notes](#14-ui-implementation-notes)

---

## 1. Authentication

All endpoints (except signup/login) require the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### POST `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-12-09T12:00:00Z",
    "email_verified": false
  }
}
```

---

### POST `/api/auth/login`

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-12-09T12:00:00Z",
    "email_verified": false
  }
}
```

**Frontend Notes:**
- Store `access_token` in localStorage or sessionStorage
- Token is a JWT - decode for expiration checking if needed
- All subsequent API calls require the bearer token

---

## 2. Meeting Upload & Metadata

### POST `/api/meetings/upload`

Upload an audio file for processing.

**Request Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ Yes | Audio file (WAV, MP3, M4A, etc.) |
| `project_id` | String | ❌ No | UUID of existing project. If omitted, auto-creates a new project |
| `metadata` | JSON String | ❌ No | JSON object with meeting metadata |

### Upload Metadata Options

The `metadata` field accepts a JSON string with these optional parameters:

```json
{
  "title": "Weekly Team Standup",
  "description": "Q4 planning discussion",
  "language": "en",
  "num_speakers": 4,
  "min_speakers": 2,
  "max_speakers": 6
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | string | `"Project {id[:8]}"` | Meeting title (also used for auto-created project name) |
| `description` | string | `null` | Meeting/project description |
| `language` | string | Auto-detected | Language code (e.g., `"en"`, `"ur"`, `"es"`) |
| `num_speakers` | integer | Auto-detected | **Exact** number of speakers (overrides min/max) |
| `min_speakers` | integer | 1 | Minimum expected speakers for diarization |
| `max_speakers` | integer | 10 | Maximum expected speakers for diarization |

**Example Upload (JavaScript Fetch):**
```javascript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('project_id', 'existing-project-uuid'); // Optional
formData.append('metadata', JSON.stringify({
  title: 'Team Standup',
  language: 'en',
  num_speakers: 3
}));

const response = await fetch('/api/meetings/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

**Response (200 OK):**
```json
{
  "meeting_id": "39c98190-70a0-481c-a80d-d58e3f49b48b",
  "project_id": "0f6c5de2-11d9-4d8a-bf31-c50cf32cba8c",
  "status": "queued",
  "stage": "asr_pending",
  "message": "Meeting uploaded. Transcription will start shortly."
}
```

---

## 3. Meeting Status & Polling

### GET `/api/meetings/{meeting_id}/status`

Get processing status. **Use for polling** during upload.

**Response:**
```json
{
  "meeting_id": "39c98190-70a0-481c-a80d-d58e3f49b48b",
  "status": "processing",
  "stage": "llm_cleanup",
  "progress": 60,
  "asr": {
    "done": true,
    "transcript_raw_available": true
  },
  "llm_cleanup": {
    "done": false,
    "streaming_available": false
  },
  "background": {
    "conflicts": "pending",
    "knowledge_graph": "pending",
    "rag": "pending"
  },
  "final_transcript_ready": false,
  "insights_ready": false
}
```

### Processing Stages

| Stage | Progress | Description |
|-------|----------|-------------|
| `asr_pending` | 0% | Queued for transcription |
| `asr_processing` | 10% | ASR (speech-to-text) running |
| `asr_done` | 30% | Raw transcript ready |
| `llm_cleanup` | 40% | LLM cleaning transcript |
| `llm_done` | 60% | Final transcript ready |
| `insights_processing` | 70% | Extracting entities, tasks, etc. |
| `completed` | 100% | All processing complete |
| `error` | - | Processing failed |

### Status Flow Diagram

```
queued → processing → completed
           ↓
         error
```

**Frontend Polling Strategy:**
```javascript
const pollStatus = async (meetingId) => {
  const poll = setInterval(async () => {
    const status = await fetch(`/api/meetings/${meetingId}/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    updateProgressUI(status.progress, status.stage);
    
    if (status.asr.transcript_raw_available) {
      // Can show raw transcript early
    }
    
    if (status.status === 'completed' || status.status === 'error') {
      clearInterval(poll);
    }
  }, 3000); // Poll every 3 seconds
};
```

---

### GET `/api/meetings`

List all meetings for the current user.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `project_id` | string | - | Filter by project |
| `limit` | integer | 50 | Max results (max: 100) |
| `offset` | integer | 0 | Pagination offset |

**Response:**
```json
{
  "meetings": [
    {
      "meeting_id": "uuid",
      "title": "Team Standup",
      "status": "completed",
      "created_at": "2025-12-09T10:00:00Z",
      "project_id": "project-uuid"
    }
  ]
}
```

---

### GET `/api/meetings/{meeting_id}`

Get meeting details.

**Response:**
```json
{
  "meeting_id": "uuid",
  "project_id": "project-uuid",
  "status": "completed",
  "stage": "completed",
  "duration_seconds": 1823.5,
  "created_at": "2025-12-09T10:00:00Z",
  "updated_at": "2025-12-09T10:35:00Z",
  "insights_ready": true
}
```

---

## 4. Transcripts

### GET `/api/meetings/{meeting_id}/transcript`

Get the meeting transcript with timestamped segments.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | `"final"` | `"raw"` or `"final"` |

**Response:**
```json
{
  "meeting_id": "uuid",
  "type": "final",
  "transcript": "John: Hello everyone, welcome to the meeting.\n\nSarah: Thanks John, let's get started.",
  "segments": [
    {
      "speaker": "John",
      "text": "Hello everyone, welcome to the meeting.",
      "start": 0.5,
      "end": 2.3,
      "start_formatted": "00:00:00"
    },
    {
      "speaker": "Sarah",
      "text": "Thanks John, let's get started.",
      "start": 2.5,
      "end": 4.8,
      "start_formatted": "00:00:02"
    }
  ],
  "is_llm_rewritten": true
}
```

### Segment Fields

| Field | Type | Description |
|-------|------|-------------|
| `speaker` | string | Display name (resolved from SPEAKER_XX) |
| `text` | string | Spoken text |
| `start` | float | Start time in **seconds** (for audio sync) |
| `end` | float | End time in **seconds** |
| `start_formatted` | string | Start time as `HH:MM:SS` (for display) |

**Frontend Audio Sync Example:**
```javascript
// Click segment to jump to timestamp
const handleSegmentClick = (segment) => {
  audioPlayer.currentTime = segment.start;
  audioPlayer.play();
};

// Highlight current segment during playback
audioPlayer.ontimeupdate = () => {
  const currentTime = audioPlayer.currentTime;
  const activeSegment = segments.find(
    s => currentTime >= s.start && currentTime < s.end
  );
  highlightSegment(activeSegment);
};
```

---

## 5. Speakers Management

### GET `/api/meetings/{meeting_id}/speakers`

Get all speakers for a meeting.

**Response:**
```json
{
  "speakers": [
    {
      "id": 16,
      "original_label": "SPEAKER_00",
      "display_name": "John",
      "known_speaker_id": 5,
      "has_embedding": true
    },
    {
      "id": 17,
      "original_label": "SPEAKER_01",
      "display_name": "SPEAKER_01",
      "known_speaker_id": null,
      "has_embedding": true
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `id` | Speaker mapping ID (for updates) |
| `original_label` | Original ASR label (e.g., `SPEAKER_00`) |
| `display_name` | Current display name (user-editable or LLM-extracted) |
| `known_speaker_id` | Link to a known speaker (null if not matched) |
| `has_embedding` | Whether voice embedding exists (for future matching) |

---

### PUT `/api/meetings/{meeting_id}/speakers/{speaker_id}`

Update a speaker's display name.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `display_name` | string | ✅ Yes | New display name |

**Example:**
```
PUT /api/meetings/abc123/speakers/16?display_name=John%20Smith
```

**Response (200 OK):**
```json
{
  "id": 16,
  "original_label": "SPEAKER_00",
  "display_name": "John Smith",
  "known_speaker_id": null,
  "has_embedding": true
}
```

---

### POST `/api/meetings/{meeting_id}/speakers`

Add a new speaker mapping manually.

**Request Body:**
```json
{
  "original_label": "SPEAKER_05",
  "display_name": "Guest Speaker"
}
```

---

## 6. Projects

### GET `/api/projects`

List all projects for the current user.

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Product Redesign",
      "description": "Q4 2025 initiative",
      "created_at": "2025-10-01T00:00:00Z",
      "meeting_count": 12
    }
  ]
}
```

---

### GET `/api/projects/{project_id}`

Get project details with meetings list.

**Response:**
```json
{
  "id": "uuid",
  "name": "Product Redesign",
  "description": "Q4 2025 initiative",
  "created_at": "2025-10-01T00:00:00Z",
  "updated_at": "2025-12-09T00:00:00Z",
  "meetings": [
    {
      "meeting_id": "uuid",
      "title": "Kickoff Meeting",
      "status": "completed",
      "created_at": "2025-10-05T10:00:00Z",
      "project_id": "uuid"
    }
  ]
}
```

---

### PUT `/api/projects/{project_id}`

Update project name or description.

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

---

## 7. Conflicts

### GET `/api/projects/{project_id}/conflicts`

Get all conflicts detected within a project across meetings.

**Response:**
```json
{
  "project_id": "uuid",
  "total_conflicts": 2,
  "conflicts": [
    {
      "id": 1,
      "source_meeting_id": "newer-meeting-uuid",
      "target_meeting_id": "older-meeting-uuid",
      "conflict_type": "task_reassignment",
      "description": "Task 'Design mockups' reassigned from Laura to David",
      "severity": "medium",
      "resolved": false,
      "created_at": "2025-12-09T10:00:00Z"
    }
  ]
}
```

### Conflict Types

| Type | Description |
|------|-------------|
| `task_reassignment` | Task was reassigned to different person |
| `deadline_change` | Deadline was modified |
| `decision_reversal` | Previous decision was reversed |
| `general` | Other conflict type |

### Severity Levels

| Level | Color Suggestion |
|-------|------------------|
| `low` | Yellow/Amber |
| `medium` | Orange |
| `high` | Red |

---

### PUT `/api/projects/{project_id}/conflicts/{conflict_id}/resolve`

Mark a conflict as resolved.

**Request Body:**
```json
{
  "resolved": true,
  "resolution_note": "Discussed in follow-up meeting, reassignment confirmed"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "resolved": true,
  "resolution_note": "Discussed in follow-up meeting, reassignment confirmed"
}
```

---

## 8. Knowledge Extraction (Entities)

### GET `/api/meetings/{meeting_id}/entities`

Get extracted entities (speakers, topics, tasks, decisions).

**Response:**
```json
{
  "meeting_id": "uuid",
  "entities": {
    "speakers": ["Laura", "David", "Andrew", "Craig"],
    "topics": [
      "Design new remote control",
      "Three-stage process",
      "Whiteboard activity"
    ],
    "tasks": [
      {
        "task": "Complete design stages",
        "assignee": "Team",
        "due": "next meeting"
      },
      {
        "task": "Research competitors",
        "assignee": "David",
        "due": "2025-12-15"
      }
    ],
    "decisions": [
      {
        "id": "uuid_decision_0",
        "description": "Proceed with three-stage design process"
      }
    ]
  }
}
```

---

## 9. Knowledge Graph

### GET `/api/meetings/{meeting_id}/graph`

Get knowledge graph for a single meeting.

**Response:**
```json
{
  "participants": [
    {
      "name": "Laura",
      "created_at": "2025-12-09T08:27:45Z"
    }
  ],
  "tasks": [
    {
      "id": "task_uuid",
      "description": "Design mockups",
      "assignee": "Laura",
      "due_date": "2025-12-15",
      "created_at": "2025-12-09T08:27:45Z"
    }
  ],
  "decisions": [
    {
      "id": "decision_uuid",
      "description": "Use agile methodology",
      "created_at": "2025-12-09T08:27:45Z"
    }
  ],
  "topics": ["Product Strategy", "Timeline"]
}
```

---

### GET `/api/projects/{project_id}/graph`

Get knowledge graph for entire project (all meetings combined).

**Response:**
```json
{
  "nodes": [
    {
      "id": 123,
      "labels": ["Meeting"],
      "properties": {
        "id": "meeting-uuid",
        "title": "Team Standup",
        "created_at": "2025-12-09T08:00:00Z"
      }
    },
    {
      "id": 124,
      "labels": ["Person"],
      "properties": {
        "name": "Laura"
      }
    },
    {
      "id": 125,
      "labels": ["Task"],
      "properties": {
        "id": "task-uuid",
        "description": "Design mockups",
        "due_date": "2025-12-15"
      }
    }
  ],
  "edges": [
    {
      "type": "PARTICIPATES_IN",
      "start": 124,
      "end": 123,
      "properties": {}
    },
    {
      "type": "ASSIGNED_TO",
      "start": 125,
      "end": 124,
      "properties": {}
    }
  ]
}
```

### Node Labels

| Label | Description |
|-------|-------------|
| `Meeting` | A meeting node |
| `Person` | A participant/speaker |
| `Task` | An action item |
| `Decision` | A decision made |
| `Topic` | A discussed topic |

### Edge Types

| Type | Description |
|------|-------------|
| `PARTICIPATES_IN` | Person → Meeting |
| `ASSIGNED_TO` | Task → Person |
| `DECIDED_IN` | Decision → Meeting |
| `DISCUSSED_IN` | Topic → Meeting |

---

### GET `/api/people/{name}/tasks`

Get all tasks assigned to a person.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `project_id` | string | ❌ No | Filter by project |

**Response:**
```json
{
  "person_name": "Laura",
  "tasks": [
    {
      "id": "task-uuid",
      "description": "Design mockups",
      "due_date": "2025-12-15",
      "status": "pending",
      "meeting_id": "meeting-uuid",
      "meeting_title": "Team Standup"
    }
  ]
}
```

---

## 10. RAG (AI Search)

### GET `/api/meetings/{meeting_id}/rag/query`

Semantic search with AI-generated answer.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | ✅ Yes | Natural language question |

**Example:**
```
GET /api/meetings/uuid/rag/query?q=What%20were%20the%20action%20items
```

**Response:**
```json
{
  "answer": "The main action items discussed were: 1) Complete the design mockups by December 15th (assigned to Laura), 2) Research competitor products (assigned to David), 3) Schedule follow-up meeting next week.",
  "context": [
    {
      "chunk": "Laura: I'll handle the mockups by the 15th...",
      "score": 0.87
    },
    {
      "chunk": "David: I can research the competitors...",
      "score": 0.72
    }
  ]
}
```

**Frontend Notes:**
- This is a synchronous call with up to 60s timeout
- Show loading state during query
- Display context sources for transparency
- Scores are similarity scores (0-1, higher is better)

---

## 11. Known Speakers

Known speakers allow cross-meeting speaker recognition using voice embeddings.

### GET `/api/known-speakers`

List all known speakers for the current user.

**Response:**
```json
{
  "known_speakers": [
    {
      "id": 5,
      "name": "Laura Smith",
      "meeting_count": 12,
      "created_at": "2025-12-01T10:00:00Z"
    }
  ]
}
```

---

### POST `/api/known-speakers`

Create a known speaker from an existing speaker mapping.

**Request Body:**
```json
{
  "name": "John Doe",
  "source_speaker_mapping_id": 17
}
```

| Field | Description |
|-------|-------------|
| `name` | Display name for the known speaker |
| `source_speaker_mapping_id` | ID from `GET /speakers` to copy voice embedding from |

**Response (201 Created):**
```json
{
  "id": 6,
  "name": "John Doe",
  "meeting_count": 1,
  "created_at": "2025-12-09T15:00:00Z"
}
```

---

### PUT `/api/known-speakers/{id}`

Update a known speaker's name.

**Request Body:**
```json
{
  "name": "John D. Smith"
}
```

**Note:** Updating a known speaker name will also update the `display_name` in all linked speaker mappings.

---

### DELETE `/api/known-speakers/{id}`

Delete a known speaker.

**Response (200 OK):**
```json
{
  "message": "Known speaker deleted successfully"
}
```

**Note:** Deleting a known speaker will unlink (set to null) the `known_speaker_id` in all associated speaker mappings, but won't delete the mappings themselves.

---

## 12. User Profile

### GET `/api/users/me`

Get current user's profile.

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified": true,
  "created_at": "2025-01-15T08:00:00Z"
}
```

---

### PUT `/api/users/me`

Update user profile.

**Request Body:**
```json
{
  "name": "John D. Smith"
}
```

---

## 13. Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not owner of resource) |
| 404 | Not Found |
| 422 | Unprocessable Entity (validation) |
| 500 | Internal Server Error |

---

## 14. UI Implementation Notes

### Recommended Components

#### Dashboard
- Project cards with meeting counts
- Recent meetings list
- Conflict alerts (unresolved count)
- Processing status indicators

#### Meeting Upload Flow
1. File selection (drag & drop)
2. Metadata form (title, language, speaker count)
3. Project selection (or auto-create)
4. Progress stepper (ASR → LLM → Insights)
5. Real-time status polling

#### Transcript Viewer
- Audio player with waveform
- Clickable timestamped segments
- Current segment highlighting
- Speaker labels (editable inline)
- Toggle raw/final transcript

#### Knowledge Graph Visualization
- Use D3.js, vis.js, or React Flow
- Color-code node types
- Interactive node clicking
- Filter by node type
- Expand/collapse relationships

#### Speaker Manager
- List meetings with speaker mappings
- Create known speakers from mappings
- Auto-match indicator badges
- Batch name updates

### State Management Tips

```javascript
// Recommended state structure
const appState = {
  auth: {
    token: string,
    user: UserProfile
  },
  projects: {
    list: Project[],
    current: ProjectDetail
  },
  meetings: {
    list: MeetingListItem[],
    current: MeetingDetail,
    transcript: TranscriptResponse,
    speakers: Speaker[],
    status: MeetingStatus
  },
  knownSpeakers: KnownSpeaker[],
  conflicts: ConflictDetail[]
};
```

### Error Handling

```javascript
// Standard error response format
{
  "detail": "Error message here"
}

// Handle auth errors
if (response.status === 401) {
  // Token expired - redirect to login
  clearToken();
  navigate('/login');
}
```

---

## Health Check Endpoints

### GET `/health`
```json
{ "status": "healthy" }
```

### GET `/`
```json
{ "message": "AI Meeting Knowledge Orchestrator API" }
```

---

## Complete Endpoint Summary (28 Total)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/meetings/upload` | Upload audio |
| GET | `/api/meetings` | List meetings |
| GET | `/api/meetings/{id}` | Meeting details |
| GET | `/api/meetings/{id}/status` | Processing status |
| GET | `/api/meetings/{id}/transcript` | Get transcript |
| GET | `/api/meetings/{id}/entities` | Get extracted entities |
| GET | `/api/meetings/{id}/rag/query` | AI search query |
| GET | `/api/meetings/{id}/speakers` | List speakers |
| PUT | `/api/meetings/{id}/speakers/{id}` | Update speaker |
| POST | `/api/meetings/{id}/speakers` | Add speaker |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/{id}` | Project details |
| PUT | `/api/projects/{id}` | Update project |
| GET | `/api/projects/{id}/conflicts` | List conflicts |
| PUT | `/api/projects/{id}/conflicts/{id}/resolve` | Resolve conflict |
| GET | `/api/projects/{id}/graph` | Project graph |
| GET | `/api/meetings/{id}/graph` | Meeting graph |
| GET | `/api/people/{name}/tasks` | Person's tasks |
| GET | `/api/known-speakers` | List known speakers |
| POST | `/api/known-speakers` | Create known speaker |
| PUT | `/api/known-speakers/{id}` | Update known speaker |
| DELETE | `/api/known-speakers/{id}` | Delete known speaker |
| GET | `/api/users/me` | Get profile |
| PUT | `/api/users/me` | Update profile |
| GET | `/health` | Health check |
| GET | `/` | Root info |

---

*Document generated from backend source files: `DEV_CONTEXT.md`, `API_testing.md`, `schemas.py`, `meetings.py`, `tasks.py`*
