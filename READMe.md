# AI Meeting Knowledge Orchestrator

Transform your meetings into structured, searchable knowledge with AI-powered transcription and entity extraction.

## 🚀 Features

- **Audio Upload**: Support for MP3, WAV, M4A, and OGG formats
- **Meeting Library**: View all processed meetings in one place
- **Speaker Diarization**: Automatic identification of different speakers
- **Transcript Viewer**: Clean, readable transcripts with timestamps
- **Smart Search**: Find specific content within transcripts
- **Entity Extraction**: Automatic extraction of tasks, decisions, and action items
- **Knowledge Graph**: Structured storage for organizational memory

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
ai-meeting-orchestrator/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── uploads/            # Uploaded audio files (created automatically)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── UploadForm.jsx
│   │   │   ├── MeetingList.jsx
│   │   │   ├── TranscriptViewer.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── EntityPanel.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx
│   │   │   └── MeetingDetailPage.jsx
│   │   ├── services/       # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
```

## 🎯 Usage

### 1. Upload a Meeting

1. Go to the home page
2. Drag & drop or browse for an audio file
3. Click "Upload & Process"
4. Wait for processing to complete

### 2. View Transcript

1. Click on any meeting from the list
2. View the full transcript with speaker labels
3. Use the search bar to find specific content
4. Click on timestamps to jump to relevant sections

### 3. Review Extracted Entities

- **Tasks**: View assigned tasks with owners and deadlines
- **Decisions**: See key decisions made during the meeting
- Click timestamp buttons to jump to relevant transcript sections

## 🔧 API Endpoints

### Upload Meeting
```
POST /api/meetings/upload
Content-Type: multipart/form-data
```

### Get All Meetings
```
GET /api/meetings
```

### Get Meeting Details
```
GET /api/meetings/{meeting_id}
```

### Get Transcript
```
GET /api/meetings/{meeting_id}/transcript
```

### Search Transcript
```
GET /api/meetings/{meeting_id}/search?q={query}
```

### Get Extracted Entities
```
GET /api/meetings/{meeting_id}/entities
```

## 🧪 Testing with Mock Data

For development purposes, you can simulate completed processing:

```bash
curl -X POST http://localhost:8000/api/meetings/{meeting_id}/mock-complete
```

This will populate the meeting with sample transcript and entity data.

## 🎨 Customization

### Modify Supported File Types

Edit `backend/main.py`:
```python
allowed_extensions = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
```

### Change Upload Size Limit

Edit `UploadForm.jsx`:
```javascript
const maxSize = 200 * 1024 * 1024; // 200MB
```

### Adjust Speaker Colors

Edit `TranscriptViewer.jsx`:
```javascript
const colors = ['#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1'];
```

## 📝 Next Steps (Future Development)

- [ ] Integrate actual ASR pipeline (WhisperX)
- [ ] Add LLM-based entity extraction
- [ ] Implement Neo4j knowledge graph
- [ ] Add audio playback synchronized with transcript
- [ ] Support real-time transcription
- [ ] Add user authentication
- [ ] Implement task management features
- [ ] Export functionality (PDF, Word)

## 🐛 Troubleshooting

### CORS Errors
Make sure the backend is running on port 8000 and frontend on port 3000.

### File Upload Fails
Check that the `uploads` directory exists and has write permissions.

### Port Already in Use
Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

## 👥 Team

- **Asim Majeed** (22K-4535) - ASR & Transcription
- **Muhammad Muzammil** (22K-4267) - Dashboard & LLM Integration
- **Ayan Hasan** (22K-4367) - Knowledge Graph & Entity Extraction

## 📄 License

This project is part of the Final Year Project at FAST-NUCES, Karachi Campus.

## 🙏 Acknowledgments

- OpenAI Whisper for ASR capabilities
- FastAPI for the backend framework
- React for the frontend framework