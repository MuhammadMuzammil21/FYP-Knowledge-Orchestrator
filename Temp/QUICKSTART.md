# Quick Start Guide

## Development (Local)

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Start PostgreSQL & Redis**:
```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
docker run -d -p 6379:6379 redis:7-alpine
```

3. **Configure**:
```bash
cp .env.example .env
# Edit .env with your HF_TOKEN
```

4. **Run API** (Terminal 1):
```bash
uvicorn app.main:app --reload
```

5. **Run Celery** (Terminal 2):
```bash
celery -A workers.celery_app worker --loglevel=info
```

## Production (Docker)

```bash
./start.sh
```

Or manually:
```bash
docker-compose up -d
```

## Testing

```bash
python test_api.py
```

## Monitoring

```bash
# View logs
docker-compose logs -f api
docker-compose logs -f celery_worker

# Celery tasks
celery -A workers.celery_app inspect active

# Database
docker exec -it backend_postgres_1 psql -U postgres -d meetings
```

## API Access

- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health
