# PostgreSQL Database Implementation Plan
## AI Meeting Knowledge Orchestrator - Database Persistence Layer

> **Status:** Planning Phase - Ready for Implementation  
> **Database:** PostgreSQL  
> **ORM:** SQLAlchemy 2.0  
> **Migration Tool:** Alembic

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema Design](#database-schema-design)
3. [Implementation Phases](#implementation-phases)
4. [Technical Stack](#technical-stack)
5. [File Structure](#file-structure)
6. [Migration Strategy](#migration-strategy)
7. [Integration Points](#integration-points)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Success Criteria](#success-criteria)

---

## 🎯 Overview

### Current State
- **Backend:** FastAPI with in-memory storage (`meetings_db`, `users_db`)
- **Data Models:** Pydantic models defined in `main.py` and `auth.py`
- **API Endpoints:** All endpoints functional but using in-memory dictionaries
- **Authentication:** Basic auth system with in-memory user storage

### Target State
- **PostgreSQL Database:** Persistent storage for all application data
- **SQLAlchemy ORM:** Type-safe database models and queries
- **Alembic Migrations:** Version-controlled schema changes
- **Database Connection Pooling:** Efficient connection management
- **Transaction Management:** ACID compliance for data integrity

### Key Requirements (from IMPLEMENTATION_GAP_ANALYSIS.md)
- ✅ Meeting metadata storage
- ✅ Transcript storage
- ✅ Entity storage (tasks, decisions, key points)
- ✅ Processing status tracking
- ✅ Audit logging
- ✅ User management (migrate from in-memory)
- ✅ User-meeting relationships (ownership)
- ✅ Data retention policies support

---

## 🗄️ Database Schema Design

### Core Tables

#### 1. **users** (User Management)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 2. **meetings** (Meeting Metadata)
```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER DEFAULT 0,  -- Duration in seconds
    status VARCHAR(20) NOT NULL DEFAULT 'processing',  -- processing, complete, failed
    speaker_count INTEGER DEFAULT 0,
    audio_file_path VARCHAR(1000) NOT NULL,  -- Path to encrypted audio file
    file_size BIGINT,  -- File size in bytes
    file_type VARCHAR(50),  -- mp3, wav, m4a, ogg
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,  -- Error details if status is 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT status_check CHECK (status IN ('processing', 'complete', 'failed'))
);

CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_upload_date ON meetings(upload_date DESC);
CREATE INDEX idx_meetings_user_status ON meetings(user_id, status);
```

#### 3. **processing_status** (Processing Status Tracking)
```sql
CREATE TABLE processing_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    current_stage VARCHAR(50) NOT NULL,  -- uploading, transcribing, extracting, complete, failed
    overall_progress INTEGER DEFAULT 0,  -- 0-100
    stage_progress JSONB,  -- {uploading: 0-100, transcribing: 0-100, extracting: 0-100, complete: 0-100}
    stage_details JSONB,  -- Additional stage-specific metadata
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT progress_check CHECK (overall_progress >= 0 AND overall_progress <= 100),
    CONSTRAINT stage_check CHECK (current_stage IN ('uploading', 'transcribing', 'extracting', 'complete', 'failed'))
);

CREATE UNIQUE INDEX idx_processing_status_meeting_id ON processing_status(meeting_id);
CREATE INDEX idx_processing_status_stage ON processing_status(current_stage);
```

#### 4. **transcript_segments** (Transcript Storage)
```sql
CREATE TABLE transcript_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    speaker VARCHAR(255) NOT NULL,
    timestamp DECIMAL(10, 3) NOT NULL,  -- Timestamp in seconds (supports milliseconds)
    text TEXT NOT NULL,
    segment_index INTEGER NOT NULL,  -- Order of segment in transcript
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT timestamp_check CHECK (timestamp >= 0)
);

CREATE INDEX idx_transcript_segments_meeting_id ON transcript_segments(meeting_id);
CREATE INDEX idx_transcript_segments_timestamp ON transcript_segments(meeting_id, timestamp);
CREATE INDEX idx_transcript_segments_speaker ON transcript_segments(meeting_id, speaker);
CREATE INDEX idx_transcript_segments_text_search ON transcript_segments USING gin(to_tsvector('english', text));  -- Full-text search
```

#### 5. **tasks** (Extracted Tasks)
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    owner VARCHAR(255) NOT NULL,  -- Speaker name or assigned person
    deadline DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, in_progress, complete, cancelled
    timestamp DECIMAL(10, 3) NOT NULL,  -- Timestamp in transcript where task was mentioned
    confidence_score DECIMAL(3, 2),  -- 0.00-1.00 confidence from LLM extraction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT status_check CHECK (status IN ('pending', 'in_progress', 'complete', 'cancelled')),
    CONSTRAINT confidence_check CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

CREATE INDEX idx_tasks_meeting_id ON tasks(meeting_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_owner ON tasks(owner);
CREATE INDEX idx_tasks_deadline ON tasks(deadline) WHERE deadline IS NOT NULL;
```

#### 6. **decisions** (Extracted Decisions)
```sql
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    statement TEXT NOT NULL,
    decided_by VARCHAR(255) NOT NULL,  -- Speaker name
    timestamp DECIMAL(10, 3) NOT NULL,  -- Timestamp in transcript where decision was made
    confidence_score DECIMAL(3, 2),  -- 0.00-1.00 confidence from LLM extraction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT confidence_check CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

CREATE INDEX idx_decisions_meeting_id ON decisions(meeting_id);
CREATE INDEX idx_decisions_decided_by ON decisions(decided_by);
CREATE INDEX idx_decisions_timestamp ON decisions(meeting_id, timestamp);
```

#### 7. **key_points** (Extracted Key Points)
```sql
CREATE TABLE key_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    point TEXT NOT NULL,
    timestamp DECIMAL(10, 3) NOT NULL,  -- Timestamp in transcript where key point was mentioned
    confidence_score DECIMAL(3, 2),  -- 0.00-1.00 confidence from LLM extraction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT confidence_check CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

CREATE INDEX idx_key_points_meeting_id ON key_points(meeting_id);
CREATE INDEX idx_key_points_timestamp ON key_points(meeting_id, timestamp);
```

#### 8. **audit_logs** (Audit Logging)
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,  -- upload, view, delete, update, search, etc.
    resource_type VARCHAR(50) NOT NULL,  -- meeting, transcript, entity, user, etc.
    resource_id UUID,  -- ID of the resource being acted upon
    details JSONB,  -- Additional action details (without sensitive data)
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_meeting_id ON audit_logs(meeting_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

#### 9. **password_reset_tokens** (Password Reset Management)
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```

#### 10. **email_verification_tokens** (Email Verification Management)
```sql
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
```

### Relationships Summary

```
users (1) ──< (many) meetings
meetings (1) ──< (1) processing_status
meetings (1) ──< (many) transcript_segments
meetings (1) ──< (many) tasks
meetings (1) ──< (many) decisions
meetings (1) ──< (many) key_points
users (1) ──< (many) audit_logs
meetings (1) ──< (many) audit_logs
users (1) ──< (many) password_reset_tokens
users (1) ──< (many) email_verification_tokens
```

---

## 📦 Implementation Phases

### Phase 1: Database Setup & Foundation (Week 1)
**Goal:** Set up PostgreSQL, SQLAlchemy, Alembic, and basic connection

#### Tasks:
1. **Install Dependencies**
   - Add PostgreSQL dependencies to `requirements.txt`
   - Install: `sqlalchemy==2.0.23`, `alembic==1.12.1`, `psycopg2-binary==2.9.9`
   - Install: `python-dotenv==1.0.1` (if not already present)

2. **Database Configuration**
   - Create `.env` file for database connection string
   - Set up database connection module (`backend/database.py`)
   - Configure SQLAlchemy engine with connection pooling
   - Set up database session management

3. **Alembic Setup**
   - Initialize Alembic in `backend/` directory
   - Configure `alembic.ini` and `alembic/env.py`
   - Set up migration directory structure

4. **Database Creation Script**
   - Create script to initialize PostgreSQL database
   - Document database setup process

**Deliverables:**
- ✅ Database connection working
- ✅ Alembic initialized and configured
- ✅ Environment variables configured
- ✅ Database creation script

---

### Phase 2: Core Models & Migrations (Week 1-2)
**Goal:** Create SQLAlchemy models and initial database schema

#### Tasks:
1. **Create SQLAlchemy Models**
   - Create `backend/models/` directory
   - Implement all 10 table models:
     - `user.py` - User model
     - `meeting.py` - Meeting model
     - `processing_status.py` - Processing status model
     - `transcript_segment.py` - Transcript segment model
     - `task.py` - Task model
     - `decision.py` - Decision model
     - `key_point.py` - Key point model
     - `audit_log.py` - Audit log model
     - `password_reset_token.py` - Password reset token model
     - `email_verification_token.py` - Email verification token model
   - Create `backend/models/__init__.py` to export all models

2. **Create Initial Migration**
   - Generate initial Alembic migration
   - Review and adjust migration script
   - Test migration on clean database

3. **Model Relationships**
   - Define foreign key relationships
   - Set up cascade delete rules
   - Configure relationship loading strategies

4. **Model Validation**
   - Add SQLAlchemy validators
   - Ensure constraints match schema design
   - Test model creation and validation

**Deliverables:**
- ✅ All SQLAlchemy models created
- ✅ Initial migration script
- ✅ Models tested with sample data
- ✅ Relationships verified

---

### Phase 3: Repository Layer (Week 2)
**Goal:** Create data access layer (repositories) for clean separation

#### Tasks:
1. **Create Repository Base Class**
   - Generic CRUD operations
   - Common query patterns
   - Error handling

2. **Implement Repositories**
   - `UserRepository` - User CRUD operations
   - `MeetingRepository` - Meeting CRUD operations
   - `ProcessingStatusRepository` - Status tracking operations
   - `TranscriptRepository` - Transcript segment operations
   - `TaskRepository` - Task operations
   - `DecisionRepository` - Decision operations
   - `KeyPointRepository` - Key point operations
   - `AuditLogRepository` - Audit logging operations
   - `TokenRepository` - Token management (password reset, email verification)

3. **Repository Methods**
   - Standard CRUD: create, read, update, delete
   - Query methods: get_by_id, get_by_user, get_by_meeting, etc.
   - Bulk operations: bulk_create, bulk_update
   - Search methods: search_transcript, filter_meetings, etc.

4. **Transaction Management**
   - Context managers for transactions
   - Rollback handling
   - Nested transaction support

**Deliverables:**
- ✅ Repository layer implemented
- ✅ All CRUD operations working
- ✅ Transaction management tested
- ✅ Error handling in place

---

### Phase 4: Migrate Auth System (Week 2-3)
**Goal:** Replace in-memory auth storage with database

#### Tasks:
1. **Update Auth Endpoints**
   - Modify `backend/auth.py` to use `UserRepository`
   - Replace `users_db` dictionary with database calls
   - Update password reset token storage
   - Update email verification token storage

2. **Data Migration**
   - Create script to migrate existing in-memory users (if any)
   - Test user creation, login, password reset
   - Verify email verification flow

3. **Session Management**
   - Ensure JWT tokens still work with database users
   - Update user lookup in authentication middleware

**Deliverables:**
- ✅ Auth system using database
- ✅ All auth endpoints tested
- ✅ Token management working
- ✅ No in-memory auth storage remaining

---

### Phase 5: Migrate Meeting Endpoints (Week 3)
**Goal:** Replace in-memory meeting storage with database

#### Tasks:
1. **Update Meeting Endpoints**
   - Modify `backend/main.py` to use repositories
   - Replace `meetings_db` dictionary with database calls
   - Update all meeting-related endpoints:
     - `POST /api/meetings/upload`
     - `GET /api/meetings`
     - `GET /api/meetings/{meeting_id}`
     - `GET /api/meetings/{meeting_id}/transcript`
     - `GET /api/meetings/{meeting_id}/search`
     - `GET /api/meetings/{meeting_id}/entities`
     - `GET /api/meetings/{meeting_id}/status`
     - `POST /api/meetings/{meeting_id}/mock-complete`

2. **User-Meeting Association**
   - Add user_id to meeting creation
   - Filter meetings by user_id in GET endpoints
   - Add authorization checks (users can only access their meetings)

3. **Processing Status Updates**
   - Update status tracking to use database
   - Implement real-time status updates via database
   - Ensure status endpoint returns database data

4. **Transcript Storage**
   - Store transcript segments in database
   - Implement bulk insert for transcript segments
   - Update transcript retrieval to query database

5. **Entity Storage**
   - Store tasks, decisions, key points in database
   - Implement bulk insert for entities
   - Update entity retrieval to query database

**Deliverables:**
- ✅ All meeting endpoints using database
- ✅ User-meeting relationships working
- ✅ Transcript storage working
- ✅ Entity storage working
- ✅ Status tracking working
- ✅ No in-memory meeting storage remaining

---

### Phase 6: Audit Logging Integration (Week 3-4)
**Goal:** Implement audit logging for all operations

#### Tasks:
1. **Create Audit Logging Middleware**
   - Log all API requests
   - Capture user actions
   - Store without sensitive data

2. **Integrate Audit Logging**
   - Add logging to all endpoints
   - Log: uploads, views, searches, updates, deletes
   - Include IP address and user agent

3. **Audit Log Queries**
   - Create endpoints for audit log viewing (admin only)
   - Implement filtering and pagination
   - Add date range queries

**Deliverables:**
- ✅ Audit logging middleware
- ✅ All operations logged
- ✅ Audit log query endpoints
- ✅ Privacy-compliant logging (no sensitive data)

---

### Phase 7: Search & Query Optimization (Week 4)
**Goal:** Optimize database queries and implement full-text search

#### Tasks:
1. **Full-Text Search Implementation**
   - Leverage PostgreSQL full-text search for transcripts
   - Implement search ranking
   - Add search result highlighting

2. **Query Optimization**
   - Add database indexes (already in schema)
   - Optimize N+1 query problems
   - Implement query result caching (optional)

3. **Pagination**
   - Add pagination to list endpoints
   - Implement cursor-based pagination for large datasets
   - Add pagination metadata to responses

4. **Filtering & Sorting**
   - Add filtering to meeting list (by status, date, etc.)
   - Add sorting options
   - Implement efficient filtered queries

**Deliverables:**
- ✅ Full-text search working
- ✅ Optimized queries
- ✅ Pagination implemented
- ✅ Filtering and sorting working

---

### Phase 8: Data Retention & Cleanup (Week 4-5)
**Goal:** Implement data retention policies and cleanup procedures

#### Tasks:
1. **Retention Policy Configuration**
   - Add retention policy settings to database
   - Create configuration table or use environment variables
   - Define default retention periods

2. **Cleanup Procedures**
   - Create scheduled cleanup tasks
   - Implement secure file deletion
   - Database record cleanup
   - Audit log retention

3. **User-Initiated Deletion**
   - Add `DELETE /api/meetings/{meeting_id}` endpoint
   - Implement cascade deletion
   - Secure file deletion
   - Audit log entry for deletions

4. **Bulk Operations**
   - Bulk delete endpoints (optional)
   - Batch cleanup operations
   - Progress tracking for large deletions

**Deliverables:**
- ✅ Retention policies configured
- ✅ Cleanup procedures implemented
- ✅ Delete endpoints working
- ✅ Secure deletion verified

---

### Phase 9: Testing & Validation (Week 5)
**Goal:** Comprehensive testing of database layer

#### Tasks:
1. **Unit Tests**
   - Test all repository methods
   - Test model validations
   - Test relationships and cascades

2. **Integration Tests**
   - Test all API endpoints with database
   - Test transaction rollbacks
   - Test concurrent access

3. **Performance Tests**
   - Test query performance
   - Test bulk operations
   - Test full-text search performance

4. **Data Migration Tests**
   - Test migration scripts
   - Test rollback procedures
   - Test data integrity

**Deliverables:**
- ✅ Unit tests passing
- ✅ Integration tests passing
- ✅ Performance benchmarks
- ✅ Migration tests passing

---

### Phase 10: Documentation & Deployment (Week 5)
**Goal:** Document database setup and prepare for deployment

#### Tasks:
1. **Documentation**
   - Database setup guide
   - Migration guide
   - Schema documentation
   - API documentation updates

2. **Environment Configuration**
   - Production database configuration
   - Development vs production settings
   - Connection string management

3. **Deployment Scripts**
   - Database initialization script
   - Migration deployment script
   - Backup and restore procedures

**Deliverables:**
- ✅ Complete documentation
- ✅ Deployment scripts
- ✅ Environment configuration
- ✅ Backup procedures documented

---

## 🛠️ Technical Stack

### Backend Dependencies
```python
# Database
sqlalchemy==2.0.23          # ORM
alembic==1.12.1             # Migrations
psycopg2-binary==2.9.9      # PostgreSQL driver
python-dotenv==1.0.1        # Environment variables

# Already installed
fastapi==0.115.0            # Web framework
pydantic==2.9.2             # Data validation
bcrypt==4.1.2               # Password hashing
```

### Database Requirements
- **PostgreSQL 12+** (recommended: PostgreSQL 14 or 15)
- **Extensions:**
  - `uuid-ossp` or `pgcrypto` (for UUID generation)
  - `pg_trgm` (for text search, optional)

---

## 📁 File Structure

```
backend/
├── database.py                 # Database connection and session management
├── models/
│   ├── __init__.py            # Export all models
│   ├── user.py                # User model
│   ├── meeting.py             # Meeting model
│   ├── processing_status.py   # Processing status model
│   ├── transcript_segment.py # Transcript segment model
│   ├── task.py                # Task model
│   ├── decision.py            # Decision model
│   ├── key_point.py           # Key point model
│   ├── audit_log.py           # Audit log model
│   ├── password_reset_token.py # Password reset token model
│   └── email_verification_token.py # Email verification token model
├── repositories/
│   ├── __init__.py            # Export all repositories
│   ├── base.py                # Base repository class
│   ├── user_repository.py     # User repository
│   ├── meeting_repository.py  # Meeting repository
│   ├── processing_status_repository.py # Status repository
│   ├── transcript_repository.py # Transcript repository
│   ├── task_repository.py     # Task repository
│   ├── decision_repository.py  # Decision repository
│   ├── key_point_repository.py # Key point repository
│   ├── audit_log_repository.py # Audit log repository
│   └── token_repository.py    # Token repository
├── alembic/
│   ├── versions/              # Migration scripts
│   ├── env.py                 # Alembic environment
│   └── script.py.mako        # Migration template
├── alembic.ini                # Alembic configuration
├── main.py                    # FastAPI app (updated to use repositories)
├── auth.py                    # Auth endpoints (updated to use repositories)
└── requirements.txt          # Updated dependencies
```

---

## 🔄 Migration Strategy

### From In-Memory to Database

#### Step 1: Parallel Implementation
- Keep in-memory storage during development
- Implement database layer alongside
- Feature flag to switch between storage types

#### Step 2: Data Migration (if needed)
- If there's existing in-memory data to preserve:
  - Create migration script
  - Export in-memory data
  - Import to database
  - Verify data integrity

#### Step 3: Gradual Cutover
- Update endpoints one by one
- Test each endpoint thoroughly
- Remove in-memory storage after all endpoints migrated

#### Step 4: Cleanup
- Remove all in-memory dictionaries
- Remove unused code
- Update documentation

---

## 🔗 Integration Points

### API Endpoints to Update

#### Authentication Endpoints (`backend/auth.py`)
- `POST /api/auth/signup` → Use `UserRepository`
- `POST /api/auth/login` → Use `UserRepository`
- `POST /api/auth/forgot-password` → Use `TokenRepository`
- `POST /api/auth/reset-password` → Use `TokenRepository`
- `POST /api/auth/verify-email` → Use `TokenRepository`
- `GET /api/auth/profile/{user_id}` → Use `UserRepository`
- `PUT /api/auth/profile/{user_id}` → Use `UserRepository`

#### Meeting Endpoints (`backend/main.py`)
- `POST /api/meetings/upload` → Use `MeetingRepository`, `ProcessingStatusRepository`
- `GET /api/meetings` → Use `MeetingRepository` (filter by user_id)
- `GET /api/meetings/{meeting_id}` → Use `MeetingRepository`, `TranscriptRepository`, entity repositories
- `GET /api/meetings/{meeting_id}/transcript` → Use `TranscriptRepository`
- `GET /api/meetings/{meeting_id}/search` → Use `TranscriptRepository` (full-text search)
- `GET /api/meetings/{meeting_id}/entities` → Use entity repositories
- `GET /api/meetings/{meeting_id}/status` → Use `ProcessingStatusRepository`
- `POST /api/meetings/{meeting_id}/mock-complete` → Use all repositories
- `DELETE /api/meetings/{meeting_id}` → **NEW** Use `MeetingRepository` (cascade delete)

### Frontend Integration
- **No changes required** - Frontend API calls remain the same
- Response formats remain compatible
- Only backend implementation changes

---

## 🔒 Security Considerations

### Database Security
1. **Connection Security**
   - Use SSL/TLS for database connections
   - Store credentials in environment variables
   - Use connection pooling with limits

2. **SQL Injection Prevention**
   - Use SQLAlchemy ORM (parameterized queries)
   - Never use raw SQL with user input
   - Validate all inputs

3. **Access Control**
   - Row-level security (users can only access their meetings)
   - Database user with minimal privileges
   - Separate read/write database users (optional)

4. **Data Encryption**
   - Encrypt sensitive fields at application level (before storing)
   - Use PostgreSQL encryption at rest (if available)
   - Secure backup storage

5. **Audit Trail**
   - Log all database operations
   - Track data access
   - Monitor for suspicious activity

---

## 🧪 Testing Strategy

### Unit Tests
- Test each repository method
- Test model validations
- Test relationships and constraints

### Integration Tests
- Test API endpoints with database
- Test transaction rollbacks
- Test concurrent operations

### Performance Tests
- Query performance benchmarks
- Bulk operation performance
- Full-text search performance
- Connection pooling efficiency

### Data Integrity Tests
- Foreign key constraints
- Cascade deletions
- Unique constraints
- Check constraints

---

## ✅ Success Criteria

### Phase 1 Success
- ✅ Database connection established
- ✅ Alembic initialized
- ✅ Environment configured

### Phase 2 Success
- ✅ All models created
- ✅ Initial migration successful
- ✅ Models tested

### Phase 3 Success
- ✅ Repository layer complete
- ✅ All CRUD operations working
- ✅ Transactions working

### Phase 4 Success
- ✅ Auth system migrated
- ✅ All auth endpoints tested
- ✅ No in-memory auth storage

### Phase 5 Success
- ✅ All meeting endpoints migrated
- ✅ User-meeting relationships working
- ✅ No in-memory meeting storage

### Phase 6 Success
- ✅ Audit logging implemented
- ✅ All operations logged
- ✅ Audit queries working

### Phase 7 Success
- ✅ Full-text search working
- ✅ Queries optimized
- ✅ Pagination implemented

### Phase 8 Success
- ✅ Retention policies configured
- ✅ Cleanup procedures working
- ✅ Delete endpoints implemented

### Phase 9 Success
- ✅ All tests passing
- ✅ Performance acceptable
- ✅ Data integrity verified

### Phase 10 Success
- ✅ Documentation complete
- ✅ Deployment ready
- ✅ Backup procedures documented

### Overall Success
- ✅ All in-memory storage replaced with database
- ✅ All API endpoints working with database
- ✅ Data persistence verified
- ✅ Performance meets requirements
- ✅ Security requirements met
- ✅ Ready for production deployment

---

## 📝 Notes & Considerations

### Performance
- Use connection pooling (SQLAlchemy default)
- Index frequently queried columns
- Use bulk operations for large inserts
- Consider read replicas for scaling (future)

### Scalability
- Database can handle thousands of meetings
- Partition large tables if needed (future)
- Archive old audit logs (future)

### Backup & Recovery
- Regular database backups
- Point-in-time recovery capability
- Test restore procedures

### Monitoring
- Monitor database connection pool
- Track slow queries
- Monitor database size
- Alert on errors

---

## 🚀 Ready for Implementation

This plan provides a comprehensive roadmap for implementing PostgreSQL database persistence. All phases are clearly defined with specific tasks, deliverables, and success criteria.

**Next Steps:**
1. Review and approve this plan
2. Set up PostgreSQL database
3. Begin Phase 1 implementation
4. Follow phases sequentially
5. Test thoroughly at each phase

**Estimated Timeline:** 5 weeks (can be adjusted based on team size and priorities)

---

*Last Updated: [Current Date]*  
*Status: Planning Complete - Ready for Implementation*

