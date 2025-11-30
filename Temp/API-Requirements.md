# **HIGH-LEVEL PIPELINE**

```
POST /meetings/upload  
→ ASR job queued  
→ ASR completes → raw transcript saved  
→ LLM cleanup job queued  
→ (LLM may stream improved transcript)  
→ Final transcript available  
→ Background jobs start:
    - conflict detection
    - knowledge graph update
    - RAG embedding
→ Insights ready
```

User sees results ASAP, background analysis never blocks.

---

# **FULL API ENDPOINT SPECIFICATION**

All endpoints are namespaced under:

```
/api/meetings
```

---

# 1 **POST /api/meetings/upload**

Upload audio + create meeting + queue ASR.

### Request (multipart/form-data)

| Field        | Type      | Required | Description                                       |
| ------------ | --------- | -------- | ------------------------------------------------- |
| `file`       | `audio/*` | ✔        | Audio file                                        |
| `project_id` | string    | ✔        | User project/group ID                             |
| `metadata`   | JSON      | ✖        | Optional meeting metadata (title, speakers, etc.) |

### Response (JSON)

```json
{
  "meeting_id": "abc123",
  "project_id": "proj_1",
  "status": "queued",
  "stage": "asr_pending",
  "message": "Meeting uploaded. Transcription will start shortly."
}
```

---

# 2️2 **GET /api/meetings**

List all meetings for a user or project.

### Query Params

| Param        | Type   | Required |
| ------------ | ------ | -------- |
| `project_id` | string | ✖        |
| `limit`      | int    | ✖        |
| `offset`     | int    | ✖        |

### Response

```json
{
  "meetings": [
    {
      "meeting_id": "abc123",
      "title": "Sprint Sync",
      "status": "completed",
      "created_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

# 3️3 **GET /api/meetings/{meeting_id}**

Get full meeting metadata.

### Response

```json
{
  "meeting_id": "abc123",
  "project_id": "proj_1",
  "status": "processing",
  "stage": "llm_cleanup",
  "duration_seconds": 320,
  "created_at": "...",
  "updated_at": "...",
  "insights_ready": false
}
```

---

# 4️4 **GET /api/meetings/{meeting_id}/status**

Central “single source of truth” for pipeline progress.

### Response

```json
{
  "meeting_id": "abc123",
  "status": "processing", 
  "stage": "llm_cleanup",
  "progress": 62,

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

Possible `stage` enums:

```
asr_pending
asr_processing
asr_done
llm_cleanup
llm_done
insights_processing
completed
error
```

---

# 5️5 **GET /api/meetings/{meeting_id}/transcript**

Retrieve raw or final transcript.

### Query params

| Param  | Type             | Description                            |
| ------ | ---------------- | -------------------------------------- |
| `type` | enum(raw, final) | Raw = ASR output, Final = LLM improved |

### Response

```json
{
  "meeting_id": "abc123",
  "type": "final",
  "transcript": "Here is the final refined transcript...",
  "is_llm_rewritten": true
}
```

---

# 6️6 **GET /api/meetings/{meeting_id}/transcript/stream**

**SSE endpoint** for streaming LLM improvements.

### SSE Events Example

```
event: partial
data: {"text": "First chunk..."}

event: partial
data: {"text": "More text..."}

event: done
data: {"final": true}
```

---

# 7️7 **GET /api/meetings/{meeting_id}/entities**

Knowledge graph summaries.

### Response

```json
{
  "meeting_id": "abc123",
  "entities": {
    "speakers": ["Alice", "Bob"],
    "topics": ["Deadline", "Budget"],
    "tasks": [
      {"assignee": "Alice", "task": "Prepare sprint board", "due": "2025-11-05"},
      {"assignee": "Bob", "task": "Client follow-up"}
    ]
  }
}
```

---

# 8️8 **GET /api/meetings/{meeting_id}/conflicts**

Cross-meeting analysis.

### Response

```json
{
  "meeting_id": "abc123",
  "conflicts": [
    {
      "type": "follow_up_missed",
      "previous_meeting": "m123",
      "description": "Task 'Prepare slides' was promised for this meeting but not discussed."
    },
    {
      "type": "deadline_conflict",
      "description": "Deadline discussed as Nov 5th earlier but mentioned Nov 10th here."
    }
  ]
}
```

---

# 9️9 **GET /api/meetings/{meeting_id}/search?q=...**

Full-text search over transcript.

### Response

```json
{
  "results": [
    {
      "snippet": "… about the sprint deadline …",
      "timestamp": 95
    }
  ]
}
```

---

# 10 **GET /api/meetings/{meeting_id}/rag/query?q=...**

Query the ChromaDB RAG store.

### Response

```json
{
  "answer": "The budget discussion happened last Friday...",
  "context": [
    {
      "chunk": "We agreed that the budget will be finalized...",
      "score": 0.89
    }
  ]
}
```

---

# **Background Tasks (No Endpoints)**

These run automatically:

### Triggered after LLM cleanup:

* `TASK_CONFLICT_ANALYSIS`
* `TASK_KNOWLEDGE_GRAPH`
* `TASK_RAG_EMBEDDING`

They update the database.

---

# 📡 **STATUS FLOW SUMMARY**

Here is how each endpoint participates in the pipeline:

```
POST /upload
→ status: asr_pending

ASR starts
→ status: asr_processing

ASR finishes
→ status: asr_done
→ transcript_raw available immediately

LLM starts cleanup
→ status: llm_cleanup
→ GET /transcript/stream (if streaming enabled)

LLM finishes
→ final transcript saved
→ status: llm_done
→ background tasks triggered

Background tasks run
→ status: insights_processing

Everything ready
→ status: completed
```

During this process if a new request to transcription arrives, that one is transcripted first. Only after that the background tasks are triggered. Only verified users can upload and view meetings. But implementing that is unrelated.

# **MINIMAL WORKING ENDPOINTS REQUIRED**


```
POST   /api/meetings/upload
GET    /api/meetings
GET    /api/meetings/{id}
GET    /api/meetings/{id}/status
GET    /api/meetings/{id}/transcript
GET    /api/meetings/{id}/transcript/stream
GET    /api/meetings/{id}/entities
GET    /api/meetings/{id}/conflicts
GET    /api/meetings/{id}/search
GET    /api/meetings/{id}/rag/query
```