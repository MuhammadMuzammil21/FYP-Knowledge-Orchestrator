# API Documentation

**Base URL:** `http://localhost:8000`  
**Version:** 2.0.0

## Authentication

All meeting endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer {your_jwt_token}
```

---

## Auth Endpoints

### POST `/api/auth/signup`

Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-01-01T00:00:00",
    "email_verified": false
  }
}
```

### POST `/api/auth/login`

Login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as signup

**Errors:**
- `401`: Invalid email or password

### GET `/api/auth/me`

Get current user info.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-01-01T00:00:00",
  "email_verified": true
}
```

### POST `/api/auth/verify-email`

Verify email address.

**Request:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response:**
```json
{
  "message": "Email has been verified successfully"
}
```

### POST `/api/auth/forgot-password`

Request password reset.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset link sent",
  "token": "reset_token"
}
```

### POST `/api/auth/reset-password`

Reset password with token.

**Request:**
```json
{
  "token": "reset_token",
  "new_password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

### PUT `/api/auth/profile`

Update user profile.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response:** UserResponse object

---

## Meeting Endpoints

### POST `/api/meetings/upload`

Upload audio file for processing.

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: Audio file (mp3, wav, m4a, ogg)
- `project_id`: Project identifier
- `metadata`: JSON string (optional)

**Response:**
```json
{
  "meeting_id": "uuid",
  "project_id": "project-123",
  "status": "queued",
  "stage": "asr_pending",
  "message": "Meeting uploaded. Transcription will start shortly."
}
```

**Errors:**
- `401`: Unauthorized (no token)
- `403`: Email not verified
- `400`: Invalid file type

### GET `/api/meetings`

List all meetings for current user.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `project_id` (optional): Filter by project
- `limit` (optional, default: 50, max: 100): Results per page
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "meetings": [
    {
      "meeting_id": "uuid",
      "title": "Team Standup",
      "status": "completed",
      "created_at": "2025-01-01T00:00:00"
    }
  ]
}
```

### GET `/api/meetings/{meeting_id}`

Get meeting details.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "meeting_id": "uuid",
  "project_id": "project-123",
  "status": "completed",
  "stage": "completed",
  "duration_seconds": 1800.5,
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T01:00:00",
  "insights_ready": true
}
```

**Errors:**
- `404`: Meeting not found
- `403`: Not your meeting

### GET `/api/meetings/{meeting_id}/status`

Get detailed processing status.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "meeting_id": "uuid",
  "status": "processing",
  "stage": "llm_cleanup",
  "progress": 45,
  "asr": {
    "done": true,
    "transcript_raw_available": true
  },
  "llm_cleanup": {
    "done": false,
    "streaming_available": true
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

**Status Values:**
- `queued`: Waiting to start
- `processing`: Currently processing
- `completed`: All done
- `error`: Failed

**Stage Values:**
- `asr_pending`: Waiting for ASR
- `asr_processing`: Transcribing audio
- `asr_done`: ASR complete
- `llm_cleanup`: Cleaning transcript
- `llm_done`: LLM complete
- `insights_processing`: Extracting insights
- `completed`: All done
- `error`: Failed

### GET `/api/meetings/{meeting_id}/transcript`

Get transcript (raw or final).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (optional, default: "final"): "raw" or "final"

**Response:**
```json
{
  "meeting_id": "uuid",
  "type": "final",
  "transcript": "Speaker 1: Hello everyone...",
  "is_llm_rewritten": true
}
```

**Errors:**
- `404`: Transcript not available yet

### GET `/api/meetings/{meeting_id}/transcript/stream`

Stream transcript updates (Server-Sent Events).

**Headers:** `Authorization: Bearer {token}`

**Response:** SSE stream

```
event: partial
data: {"text": "Speaker 1: Hello..."}

event: done
data: {"final": true}
```

**Usage Example:**
```javascript
const eventSource = new EventSource(
  `/api/meetings/${id}/transcript/stream`,
  { headers: { Authorization: `Bearer ${token}` }}
);

eventSource.addEventListener('partial', (e) => {
  const data = JSON.parse(e.data);
  console.log(data.text);
});

eventSource.addEventListener('done', (e) => {
  eventSource.close();
});
```

### GET `/api/meetings/{meeting_id}/entities`

Get extracted entities (speakers, topics, tasks).

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "meeting_id": "uuid",
  "entities": {
    "speakers": ["John", "Jane", "Bob"],
    "topics": ["Q4 Planning", "Budget Review"],
    "tasks": [
      {
        "assignee": "John",
        "task": "Prepare Q4 budget",
        "due": "2025-01-15"
      }
    ]
  }
}
```

**Errors:**
- `404`: Entities not ready yet

### GET `/api/meetings/{meeting_id}/conflicts`

Get conflict analysis with previous meetings.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "meeting_id": "uuid",
  "conflicts": [
    {
      "type": "deadline_conflict",
      "description": "Task deadline conflicts with previous meeting",
      "severity": "high",
      "related_meeting_id": "other-uuid"
    }
  ]
}
```

### GET `/api/meetings/{meeting_id}/search`

Full-text search within transcript.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `q` (required): Search query

**Response:**
```json
{
  "results": [
    {
      "snippet": "...discussing the budget for Q4...",
      "timestamp": null
    }
  ]
}
```

### GET `/api/meetings/{meeting_id}/rag/query`

Semantic search with AI-generated answer.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `q` (required): Question to ask

**Response:**
```json
{
  "answer": "The main topics discussed were Q4 planning and budget allocation...",
  "context": [
    {
      "chunk": "We need to finalize the Q4 budget...",
      "score": 0.95
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "detail": "Error message here"
}
```

**Common Status Codes:**
- `200`: Success
- `400`: Bad request (invalid data)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (email not verified or not your resource)
- `404`: Not found
- `500`: Server error

---

## Rate Limiting

No rate limiting currently implemented.

---

## CORS

CORS is enabled for all origins (`*`). In production, restrict to your frontend domain.

---

## File Upload Limits

- **Max file size**: Not specified (configure in production)
- **Allowed formats**: mp3, wav, m4a, ogg

---

## Processing Pipeline

1. **Upload** → Audio saved, Celery task queued
2. **ASR** (10-30%) → WhisperX transcription with speaker diarization
3. **Token Count** → Count tokens in transcript
4. **LLM Cleanup** (30-60%) → Qwen3 8B cleanup (if < 7000 tokens, else skip)
5. **Insights** (60-100%) → Extract entities, conflicts, knowledge graph, RAG embedding

**Typical Processing Time:**
- 30-minute meeting: ~5-10 minutes
- 1-hour meeting: ~10-20 minutes

---

## WebSocket Support

Not currently implemented. Use SSE for transcript streaming.

---

## Pagination

Use `limit` and `offset` for pagination:

```
GET /api/meetings?limit=20&offset=40
```

---

## Best Practices

1. **Store JWT token** securely (localStorage or httpOnly cookie)
2. **Check email_verified** before allowing uploads
3. **Poll `/status` endpoint** every 2-5 seconds during processing
4. **Handle 401/403** by redirecting to login
5. **Show progress** using `progress` field (0-100)
6. **Use SSE** for real-time transcript updates
7. **Verify meeting ownership** - API handles this automatically

---

## Example Frontend Flow

```javascript
// 1. Login
const { access_token, user } = await login(email, password);
localStorage.setItem('token', access_token);

// 2. Check verification
if (!user.email_verified) {
  showVerificationPrompt();
}

// 3. Upload meeting
const formData = new FormData();
formData.append('file', audioFile);
formData.append('project_id', 'project-123');
formData.append('metadata', JSON.stringify({ title: 'Team Meeting' }));

const { meeting_id } = await fetch('/api/meetings/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData
}).then(r => r.json());

// 4. Poll status
const interval = setInterval(async () => {
  const status = await fetch(`/api/meetings/${meeting_id}/status`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  
  updateProgress(status.progress);
  
  if (status.insights_ready) {
    clearInterval(interval);
    loadInsights(meeting_id);
  }
}, 3000);

// 5. Get results
const entities = await fetch(`/api/meetings/${meeting_id}/entities`, {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());
```
