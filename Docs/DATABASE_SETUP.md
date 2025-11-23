# Database Setup Guide

This guide will help you set up the PostgreSQL database connection for the AI Meeting Knowledge Orchestrator.

## Prerequisites

1. **PostgreSQL installed and running**
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

2. **Python dependencies installed**
   ```bash
   pip install -r requirements.txt
   ```

## Step 1: Create the Database

1. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```

2. Create the database:
   ```sql
   CREATE DATABASE meeting_orchestrator;
   ```

3. (Optional) Create a dedicated user:
   ```sql
   CREATE USER meeting_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE meeting_orchestrator TO meeting_user;
   ```

## Step 2: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** and update the database connection string:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meeting_orchestrator
   ```
   
   Replace with your actual:
   - Username (default: `postgres`)
   - Password (default: `postgres`)
   - Host (default: `localhost`)
   - Port (default: `5432`)
   - Database name (default: `meeting_orchestrator`)

   **Format:** `postgresql://[user]:[password]@[host]:[port]/[database]`

## Step 3: Create Database Schema

Run the SQL schema file to create all tables:

```bash
psql -U postgres -d meeting_orchestrator -f ../database/schema.sql
```

Or using the connection string from .env:
```bash
psql $DATABASE_URL -f ../database/schema.sql
```

## Step 4: Test Database Connection

Test the connection using the database module:

```bash
cd backend
python database.py
```

You should see:
```
Testing database connection to: localhost:5432/meeting_orchestrator
✅ Database connection successful!
```

## Step 5: Verify Setup

1. **Check tables were created:**
   ```sql
   \dt
   ```
   
   You should see all 10 tables:
   - users
   - meetings
   - processing_status
   - transcript_segments
   - tasks
   - decisions
   - key_points
   - audit_logs
   - password_reset_tokens
   - email_verification_tokens

2. **Check indexes:**
   ```sql
   \di
   ```

## Connection Pool Settings

The database connection uses a connection pool for efficiency. You can adjust these in `.env`:

- `DB_POOL_SIZE=5` - Number of connections to maintain
- `DB_MAX_OVERFLOW=10` - Additional connections allowed
- `DB_POOL_TIMEOUT=30` - Seconds to wait for a connection
- `DB_POOL_RECYCLE=3600` - Recycle connections after 1 hour

## Troubleshooting

### Connection Refused
- **Error:** `could not connect to server: Connection refused`
- **Solution:** 
  - Check PostgreSQL is running: `pg_isready` or `sudo systemctl status postgresql`
  - Verify host and port in DATABASE_URL

### Authentication Failed
- **Error:** `password authentication failed`
- **Solution:**
  - Check username and password in DATABASE_URL
  - Verify PostgreSQL user exists and has correct password

### Database Does Not Exist
- **Error:** `database "meeting_orchestrator" does not exist`
- **Solution:**
  - Create the database: `CREATE DATABASE meeting_orchestrator;`

### Permission Denied
- **Error:** `permission denied for database`
- **Solution:**
  - Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE meeting_orchestrator TO your_user;`

### SSL Connection Required
- **Error:** `SSL connection required`
- **Solution:**
  - Add `?sslmode=disable` to DATABASE_URL (development only)
  - Or configure SSL properly for production

## Using the Database Module

In your FastAPI routes, use the `get_db` dependency:

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db

@app.get("/items")
def get_items(db: Session = Depends(get_db)):
    # Use db session here
    items = db.query(Item).all()
    return items
```

## Next Steps

After setting up the database connection:

1. ✅ Database connection configured
2. ⏭️ Create SQLAlchemy models (Phase 2)
3. ⏭️ Set up Alembic migrations (Phase 2)
4. ⏭️ Create repository layer (Phase 3)

See `Docs/DATABASE_IMPLEMENTATION_PLAN.md` for the complete implementation roadmap.

