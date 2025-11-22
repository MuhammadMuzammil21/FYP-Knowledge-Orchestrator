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
npm run dev
```

The application will open at `http://localhost:3000`

**Note**: For production builds, use:
```bash
npm run build
npm start
```

## 📁 Project Structure

```
FYP-Knowledge-Orchestrator/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── uploads/            # Uploaded audio files (created automatically)
│
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   │   ├── layout.tsx  # Root layout
│   │   │   ├── page.tsx    # Home page
│   │   │   ├── providers.tsx # React Query & other providers
│   │   │   └── globals.css # Global styles
│   │   ├── lib/
│   │   │   ├── api/        # API client & services
│   │   │   │   ├── client.ts      # Axios client configuration
│   │   │   │   └── meetings.ts    # Meeting API endpoints
│   │   │   ├── hooks/      # Custom React hooks
│   │   │   │   ├── useMeetings.ts
│   │   │   │   └── useTranscript.ts
│   │   │   └── utils/      # Utility functions
│   │   │       ├── cn.ts           # Class name utilities
│   │   │       ├── formatters.ts   # Date/time formatters
│   │   │       └── validation.ts   # Form validation
│   │   ├── config/         # Configuration constants
│   │   │   └── constants.ts
│   │   └── types/          # TypeScript type definitions
│   │       └── index.ts
│   ├── package.json
│   ├── next.config.ts      # Next.js configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── tsconfig.json       # TypeScript configuration
│
└── README.md
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

### Get Processing Status
```
GET /api/meetings/{meeting_id}/status
```

### Mock Complete (Testing)
```
POST /api/meetings/{meeting_id}/mock-complete
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

Edit `frontend/src/config/constants.ts`:
```typescript
export const APP_CONFIG = {
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '104857600'), // 100MB
  // ...
};
```

### Adjust Speaker Colors

Edit `frontend/src/config/constants.ts`:
```typescript
export const SPEAKER_COLORS = [
  '#1890ff',
  '#52c41a',
  '#fa8c16',
  '#eb2f96',
  '#722ed1',
  '#13c2c2',
] as const;
```

### Change API Base URL

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **aiofiles** - Async file operations

## 📝 Next Steps (Future Development)

- [ ] Integrate actual ASR pipeline (WhisperX)
- [ ] Add LLM-based entity extraction
- [ ] Implement Neo4j knowledge graph
- [ ] Add audio playback synchronized with transcript
- [ ] Support real-time transcription
- [ ] Add user authentication
- [ ] Implement task management features
- [ ] Export functionality (PDF, Word)
- [ ] Add database persistence (currently in-memory)

## 🐛 Troubleshooting

### CORS Errors
Make sure the backend is running on port 8000 and frontend on port 3000. The backend CORS middleware is configured to allow requests from `http://localhost:3000`.

### File Upload Fails
Check that the `uploads` directory exists in the backend folder and has write permissions. It should be created automatically on first run.

### Port Already in Use
Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Next.js Build Errors
If you encounter TypeScript errors during build, ensure all dependencies are installed:
```bash
cd frontend
npm install
```

### Environment Variables
If the API URL is not working, check that `NEXT_PUBLIC_API_URL` is set correctly in your `.env.local` file or use the default `http://localhost:8000/api`.

## 👥 Team

- **Asim Majeed** (22K-4535) - ASR & Transcription
- **Muhammad Muzammil** (22K-4267) - Dashboard & LLM Integration
- **Ayan Hasan** (22K-4367) - Knowledge Graph & Entity Extraction

## 📄 License

This project is part of the Final Year Project at FAST-NUCES, Karachi Campus.

## 🙏 Acknowledgments

- OpenAI Whisper for ASR capabilities
- FastAPI for the backend framework
- Next.js for the frontend framework
- TanStack Query for data fetching