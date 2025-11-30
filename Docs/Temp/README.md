# Meeting Analysis API - Production Backend

Production-ready FastAPI backend for meeting transcription and analysis using ASR (WhisperX) and LLM (Qwen3 8B) pipelines with Celery task queue.

## Features

- ✅ **JWT Authentication** - Secure user authentication with email verification
- ✅ **User Isolation** - Users can only access their own meetings
- ✅ **Celery Task Queue** with Redis broker
- ✅ **PostgreSQL** database support
- ✅ **Conditional LLM Processing** - Qwen3 8B for transcripts < 7000 tokens, skip for larger
- ✅ **Token Counting** with automatic threshold detection
- ✅ **Docker Compose** setup for easy deployment
- ✅ **All 10 API endpoints** as per requirements
- ✅ **Background task processing** with retry logic

## Quick Start with Docker

1. **Set environment variables**:
```bash
cp .env.example .env
# Edit .env with your HF_TOKEN
```

2. **Start all services**:
```bash
docker-compose up -d
```

3. **Access the API**:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Local Development

### Prerequisites
- Python 3.10+
- PostgreSQL 15+
- Redis 7+

### Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Start PostgreSQL and Redis**:
```bash
# Using Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
docker run -d -p 6379:6379 redis:7-alpine
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Run the API server**:
```bash
cd backend
uvicorn app.main:app --reload
```

5. **Run Celery worker** (in another terminal):
```bash
cd backend
celery -A workers.celery_app worker --loglevel=info
```

## Architecture

### Folder Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── database.py          # Database models
│   └── schemas.py           # Pydantic schemas
├── services/
│   ├── asr/
│   │   └── whisperx_service.py
│   └── llm/
│       ├── qwen3_service.py
│       ├── rag_service.py
│       ├── extractor.py
│       ├── conflict_detector.py
│       └── preprocessor.py
├── workers/
│   ├── celery_app.py        # Celery configuration
│   └── tasks.py             # Background tasks
└── utils/
    └── token_counter.py     # Token counting

```

### Pipeline Flow

1. **Upload** → Audio file saved, Celery task queued
2. **ASR Task** → WhisperX transcription with diarization
3. **Token Count** → Count tokens in raw transcript
4. **LLM Task** → 
   - If < 7000 tokens: Qwen3 8B cleanup
   - If ≥ 7000 tokens: Skip cleanup, use raw transcript
5. **Insights Task** → Extract entities, conflicts, build knowledge graph, embed in RAG

### LLM Strategy

- **Qwen3 8B** (8500 token context window)
  - Used for transcripts under 7000 tokens
  - Handles cleanup, entity extraction, conflict detection
  - Efficient and fast for most meetings

- **Skip LLM** for large transcripts (≥ 7000 tokens)
  - Prevents context overflow
  - Uses raw transcript directly
  - Still performs entity extraction and RAG embedding

## API Endpoints

All endpoints are under `/api/meetings`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload audio and start processing |
| GET | `/` | List all meetings |
| GET | `/{id}` | Get meeting details |
| GET | `/{id}/status` | Get processing status |
| GET | `/{id}/transcript` | Get transcript (raw/final) |
| GET | `/{id}/transcript/stream` | SSE streaming |
| GET | `/{id}/entities` | Get extracted entities |
| GET | `/{id}/conflicts` | Get conflict analysis |
| GET | `/{id}/search` | Full-text search |
| GET | `/{id}/rag/query` | RAG semantic search |

## Monitoring

### Celery Tasks
```bash
# Monitor Celery worker
celery -A workers.celery_app events

# Inspect active tasks
celery -A workers.celery_app inspect active
```

### Database
```bash
# Connect to PostgreSQL
docker exec -it backend_postgres_1 psql -U postgres -d meetings
```

### Redis
```bash
# Monitor Redis
docker exec -it backend_redis_1 redis-cli MONITOR
```

## Production Deployment

1. **Set production environment variables**
2. **Use proper PostgreSQL credentials**
3. **Configure Redis with persistence**
4. **Set up reverse proxy (nginx)**
5. **Enable HTTPS**
6. **Scale Celery workers** as needed:
```bash
docker-compose up -d --scale celery_worker=4
```

## Testing

```bash
# Run test script
python test_api.py
```

## Configuration

Key environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `CELERY_BROKER_URL`: Redis broker URL
- `HF_TOKEN`: HuggingFace token for model downloads
- `CUDA_AVAILABLE`: Enable GPU acceleration
- `TOKEN_THRESHOLD_SKIP_LLM`: Token threshold (default: 7000)
