from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import uuid
import aiofiles
from datetime import datetime
from pathlib import Path
import re
from auth import router as auth_router

app = FastAPI(title="AI Meeting Orchestrator API")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
app.include_router(auth_router)

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# In-memory storage (replace with database later)
meetings_db = {}

# Pydantic models
class MeetingMetadata(BaseModel):
    id: str
    title: str
    uploadDate: str
    duration: Optional[int] = 0
    status: str
    speakerCount: int
    audioUrl: str

class TranscriptSegment(BaseModel):
    speaker: str
    timestamp: float
    text: str

class Task(BaseModel):
    id: str
    description: str
    owner: str
    deadline: Optional[str]
    status: str
    timestamp: float

class Decision(BaseModel):
    id: str
    statement: str
    decidedBy: str
    timestamp: float

class KeyPoint(BaseModel):
    id: str
    point: str
    timestamp: float

class Entities(BaseModel):
    tasks: List[Task]
    decisions: List[Decision]
    keyPoints: List[KeyPoint]

@app.get("/")
async def root():
    return {"message": "AI Meeting Orchestrator API", "version": "1.0.0"}

@app.post("/api/meetings/upload")
async def upload_meeting(file: UploadFile = File(...)):
    """Upload meeting audio file"""
    
    # Validate file type
    allowed_extensions = {".mp3", ".wav", ".m4a", ".ogg"}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Generate unique ID
    meeting_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{meeting_id}{file_ext}"
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Create meeting metadata
    meeting = {
        "id": meeting_id,
        "title": file.filename.replace(file_ext, ""),
        "uploadDate": datetime.now().isoformat(),
        "duration": 0,
        "status": "processing",
        "speakerCount": 0,
        "audioUrl": str(file_path),
        "transcript": [],
        "entities": {"tasks": [], "decisions": [], "keyPoints": []}
    }
    
    meetings_db[meeting_id] = meeting
    
    # TODO: Trigger async processing pipeline
    # For now, return immediately
    
    return {
        "meeting_id": meeting_id,
        "status": "processing",
        "message": "File uploaded successfully"
    }

@app.get("/api/meetings")
async def get_meetings():
    """Get all meetings"""
    meetings = [
        {
            "id": m["id"],
            "title": m["title"],
            "uploadDate": m["uploadDate"],
            "duration": m["duration"],
            "status": m["status"],
            "speakerCount": m["speakerCount"],
            "audioUrl": m["audioUrl"]
        }
        for m in meetings_db.values()
    ]
    return {"meetings": meetings}

@app.get("/api/meetings/{meeting_id}")
async def get_meeting(meeting_id: str):
    """Get meeting details"""
    if meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return meetings_db[meeting_id]

@app.get("/api/meetings/{meeting_id}/transcript")
async def get_transcript(meeting_id: str):
    """Get meeting transcript"""
    if meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return {
        "meetingId": meeting_id,
        "segments": meetings_db[meeting_id]["transcript"]
    }

@app.get("/api/meetings/{meeting_id}/search")
async def search_transcript(meeting_id: str, q: str):
    """Search within transcript with highlighted snippets"""
    if meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    transcript = meetings_db[meeting_id]["transcript"]
    results = []
    
    # Create a regex pattern for case-insensitive matching
    pattern = re.compile(re.escape(q), re.IGNORECASE)
    
    for idx, segment in enumerate(transcript):
        text = segment["text"]
        if pattern.search(text):
            # Find all matches and create highlighted snippets
            matches = list(pattern.finditer(text))
            highlighted_text = text
            # Replace matches with highlighted version (using HTML-like tags)
            # We'll replace from end to start to preserve indices
            for match in reversed(matches):
                start, end = match.span()
                highlighted_text = (
                    highlighted_text[:start] + 
                    f"<mark>{highlighted_text[start:end]}</mark>" + 
                    highlighted_text[end:]
                )
            
            # Create snippet with context (50 chars before and after first match)
            first_match = matches[0]
            snippet_start = max(0, first_match.start() - 50)
            snippet_end = min(len(text), first_match.end() + 50)
            snippet = text[snippet_start:snippet_end]
            
            # Highlight the query in the snippet
            snippet_highlighted = pattern.sub(
                lambda m: f"<mark>{m.group()}</mark>", 
                snippet
            )
            
            results.append({
                "segmentIndex": idx,
                "speaker": segment["speaker"],
                "timestamp": segment["timestamp"],
                "text": segment["text"],
                "highlightedText": highlighted_text,
                "snippet": snippet_highlighted
            })
    
    return {
        "query": q,
        "count": len(results),
        "results": results
    }

@app.get("/api/meetings/{meeting_id}/entities")
async def get_entities(meeting_id: str):
    """Get extracted entities"""
    if meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return meetings_db[meeting_id]["entities"]

@app.get("/api/meetings/{meeting_id}/status")
async def get_status(meeting_id: str):
    """Get processing status"""
    if meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return {
        "meeting_id": meeting_id,
        "status": meetings_db[meeting_id]["status"]
    }

# Mock endpoint to simulate processing completion (for testing)
@app.post("/api/meetings/{meeting_id}/mock-complete")
async def mock_complete(meeting_id: str):
    """Mock endpoint to simulate completed processing"""
    if meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Update with mock data
    meetings_db[meeting_id].update({
        "status": "complete",
        "duration": 2700,
        "speakerCount": 3,
        "transcript": [
            {
                "speaker": "Speaker 1",
                "timestamp": 15.5,
                "text": "Let's start with the Q3 targets. Hamein revenue goal achieve karna hai."
            },
            {
                "speaker": "Speaker 2",
                "timestamp": 45.2,
                "text": "I think we should focus on client retention first."
            },
            {
                "speaker": "Speaker 1",
                "timestamp": 78.8,
                "text": "Good point. Muhammad, can you prepare the Q4 budget draft by November 1st?"
            }
        ],
        "entities": {
            "tasks": [
                {
                    "id": str(uuid.uuid4()),
                    "description": "Prepare Q4 budget draft",
                    "owner": "Speaker 2",
                    "deadline": "2025-11-01",
                    "status": "pending",
                    "timestamp": 78.8
                }
            ],
            "decisions": [
                {
                    "id": str(uuid.uuid4()),
                    "statement": "Focus on client retention as top priority",
                    "decidedBy": "Speaker 2",
                    "timestamp": 45.2
                }
            ],
            "keyPoints": [
                {
                    "id": str(uuid.uuid4()),
                    "point": "Q3 revenue goals need to be achieved",
                    "timestamp": 15.5
                },
                {
                    "id": str(uuid.uuid4()),
                    "point": "Client retention is the primary focus area",
                    "timestamp": 45.2
                }
            ]
        }
    })
    
    return {"message": "Processing completed", "meeting_id": meeting_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)