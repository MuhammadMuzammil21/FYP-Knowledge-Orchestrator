-- ============================================================================
-- AI Meeting Knowledge Orchestrator - Database Schema DDL
-- PostgreSQL Database Schema Definition
-- ============================================================================
-- 
-- This file contains the complete database schema for the AI Meeting
-- Knowledge Orchestrator application. It includes all tables, indexes,
-- constraints, and relationships.
--
-- Database: PostgreSQL 12+ (recommended: PostgreSQL 14 or 15)
-- Created: 2025
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
-- Enable UUID generation (if not already enabled)
-- PostgreSQL 13+ has gen_random_uuid() built-in, older versions need extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for advanced text search (optional, for future use)
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- TABLE: users
-- Description: User account management
-- ============================================================================
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

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_active = TRUE;

-- Comments for users table
COMMENT ON TABLE users IS 'User account information and authentication data';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN users.email IS 'User email address (unique, validated format)';
COMMENT ON COLUMN users.name IS 'User display name';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.email_verified IS 'Whether the email address has been verified';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active';

-- ============================================================================
-- TABLE: meetings
-- Description: Meeting metadata and file information
-- ============================================================================
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER DEFAULT 0,  -- Duration in seconds
    status VARCHAR(20) NOT NULL DEFAULT 'processing',  -- processing, complete, failed
    speaker_count INTEGER DEFAULT 0,
    audio_file_path VARCHAR(1000) NOT NULL,  -- Path to audio file
    file_size BIGINT,  -- File size in bytes
    file_type VARCHAR(50),  -- mp3, wav, m4a, ogg
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,  -- Error details if status is 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT status_check CHECK (status IN ('processing', 'complete', 'failed'))
);

-- Indexes for meetings table
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_upload_date ON meetings(upload_date DESC);
CREATE INDEX idx_meetings_user_status ON meetings(user_id, status);
CREATE INDEX idx_meetings_created_at ON meetings(created_at DESC);

-- Comments for meetings table
COMMENT ON TABLE meetings IS 'Meeting metadata and audio file information';
COMMENT ON COLUMN meetings.id IS 'Unique identifier for the meeting';
COMMENT ON COLUMN meetings.user_id IS 'Owner of the meeting (foreign key to users)';
COMMENT ON COLUMN meetings.title IS 'Meeting title (usually derived from filename)';
COMMENT ON COLUMN meetings.duration IS 'Meeting duration in seconds';
COMMENT ON COLUMN meetings.status IS 'Processing status: processing, complete, or failed';
COMMENT ON COLUMN meetings.audio_file_path IS 'Path to the uploaded audio file';
COMMENT ON COLUMN meetings.error_message IS 'Error message if processing failed';

-- ============================================================================
-- TABLE: processing_status
-- Description: Real-time processing status tracking for meetings
-- ============================================================================
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

-- Indexes for processing_status table
CREATE UNIQUE INDEX idx_processing_status_meeting_id ON processing_status(meeting_id);
CREATE INDEX idx_processing_status_stage ON processing_status(current_stage);
CREATE INDEX idx_processing_status_updated_at ON processing_status(updated_at DESC);

-- Comments for processing_status table
COMMENT ON TABLE processing_status IS 'Real-time processing status for each meeting';
COMMENT ON COLUMN processing_status.meeting_id IS 'Reference to the meeting (one-to-one relationship)';
COMMENT ON COLUMN processing_status.current_stage IS 'Current processing stage';
COMMENT ON COLUMN processing_status.overall_progress IS 'Overall progress percentage (0-100)';
COMMENT ON COLUMN processing_status.stage_progress IS 'JSON object with progress for each stage';
COMMENT ON COLUMN processing_status.stage_details IS 'Additional metadata for the current stage';

-- ============================================================================
-- TABLE: transcript_segments
-- Description: Individual transcript segments with speaker and timestamp
-- ============================================================================
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

-- Indexes for transcript_segments table
CREATE INDEX idx_transcript_segments_meeting_id ON transcript_segments(meeting_id);
CREATE INDEX idx_transcript_segments_timestamp ON transcript_segments(meeting_id, timestamp);
CREATE INDEX idx_transcript_segments_speaker ON transcript_segments(meeting_id, speaker);
CREATE INDEX idx_transcript_segments_segment_index ON transcript_segments(meeting_id, segment_index);
-- Full-text search index for transcript text
CREATE INDEX idx_transcript_segments_text_search ON transcript_segments USING gin(to_tsvector('english', text));

-- Comments for transcript_segments table
COMMENT ON TABLE transcript_segments IS 'Individual segments of meeting transcripts';
COMMENT ON COLUMN transcript_segments.meeting_id IS 'Reference to the meeting';
COMMENT ON COLUMN transcript_segments.speaker IS 'Speaker identifier or name';
COMMENT ON COLUMN transcript_segments.timestamp IS 'Timestamp in seconds (with millisecond precision)';
COMMENT ON COLUMN transcript_segments.text IS 'Transcript text for this segment';
COMMENT ON COLUMN transcript_segments.segment_index IS 'Order of segment within the transcript';

-- ============================================================================
-- TABLE: tasks
-- Description: Extracted tasks from meetings
-- ============================================================================
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

-- Indexes for tasks table
CREATE INDEX idx_tasks_meeting_id ON tasks(meeting_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_owner ON tasks(owner);
CREATE INDEX idx_tasks_deadline ON tasks(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_tasks_timestamp ON tasks(meeting_id, timestamp);

-- Comments for tasks table
COMMENT ON TABLE tasks IS 'Tasks extracted from meeting transcripts';
COMMENT ON COLUMN tasks.meeting_id IS 'Reference to the meeting';
COMMENT ON COLUMN tasks.description IS 'Task description';
COMMENT ON COLUMN tasks.owner IS 'Person assigned to the task';
COMMENT ON COLUMN tasks.deadline IS 'Task deadline date';
COMMENT ON COLUMN tasks.status IS 'Task status: pending, in_progress, complete, or cancelled';
COMMENT ON COLUMN tasks.timestamp IS 'Timestamp in transcript where task was mentioned';
COMMENT ON COLUMN tasks.confidence_score IS 'Confidence score from LLM extraction (0.00-1.00)';

-- ============================================================================
-- TABLE: decisions
-- Description: Extracted decisions from meetings
-- ============================================================================
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

-- Indexes for decisions table
CREATE INDEX idx_decisions_meeting_id ON decisions(meeting_id);
CREATE INDEX idx_decisions_decided_by ON decisions(decided_by);
CREATE INDEX idx_decisions_timestamp ON decisions(meeting_id, timestamp);

-- Comments for decisions table
COMMENT ON TABLE decisions IS 'Decisions extracted from meeting transcripts';
COMMENT ON COLUMN decisions.meeting_id IS 'Reference to the meeting';
COMMENT ON COLUMN decisions.statement IS 'Decision statement';
COMMENT ON COLUMN decisions.decided_by IS 'Person who made the decision';
COMMENT ON COLUMN decisions.timestamp IS 'Timestamp in transcript where decision was made';
COMMENT ON COLUMN decisions.confidence_score IS 'Confidence score from LLM extraction (0.00-1.00)';

-- ============================================================================
-- TABLE: key_points
-- Description: Extracted key points from meetings
-- ============================================================================
CREATE TABLE key_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    point TEXT NOT NULL,
    timestamp DECIMAL(10, 3) NOT NULL,  -- Timestamp in transcript where key point was mentioned
    confidence_score DECIMAL(3, 2),  -- 0.00-1.00 confidence from LLM extraction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT confidence_check CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

-- Indexes for key_points table
CREATE INDEX idx_key_points_meeting_id ON key_points(meeting_id);
CREATE INDEX idx_key_points_timestamp ON key_points(meeting_id, timestamp);

-- Comments for key_points table
COMMENT ON TABLE key_points IS 'Key points extracted from meeting transcripts';
COMMENT ON COLUMN key_points.meeting_id IS 'Reference to the meeting';
COMMENT ON COLUMN key_points.point IS 'Key point text';
COMMENT ON COLUMN key_points.timestamp IS 'Timestamp in transcript where key point was mentioned';
COMMENT ON COLUMN key_points.confidence_score IS 'Confidence score from LLM extraction (0.00-1.00)';

-- ============================================================================
-- TABLE: audit_logs
-- Description: Audit trail for all user actions
-- ============================================================================
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

-- Indexes for audit_logs table
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_meeting_id ON audit_logs(meeting_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);

-- Comments for audit_logs table
COMMENT ON TABLE audit_logs IS 'Audit trail for all user actions and system events';
COMMENT ON COLUMN audit_logs.user_id IS 'User who performed the action (nullable for system actions)';
COMMENT ON COLUMN audit_logs.meeting_id IS 'Meeting related to the action (if applicable)';
COMMENT ON COLUMN audit_logs.action IS 'Action type: upload, view, delete, update, search, etc.';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource: meeting, transcript, entity, user, etc.';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the resource being acted upon';
COMMENT ON COLUMN audit_logs.details IS 'Additional action details in JSON format (no sensitive data)';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the client';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string from the client';

-- ============================================================================
-- TABLE: password_reset_tokens
-- Description: Password reset token management
-- ============================================================================
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for password_reset_tokens table
CREATE UNIQUE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_active ON password_reset_tokens(token, expires_at) WHERE used_at IS NULL;

-- Comments for password_reset_tokens table
COMMENT ON TABLE password_reset_tokens IS 'Password reset tokens for user password recovery';
COMMENT ON COLUMN password_reset_tokens.user_id IS 'User requesting password reset';
COMMENT ON COLUMN password_reset_tokens.token IS 'Unique reset token';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiration timestamp';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Timestamp when token was used (NULL if unused)';

-- ============================================================================
-- TABLE: email_verification_tokens
-- Description: Email verification token management
-- ============================================================================
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for email_verification_tokens table
CREATE UNIQUE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
CREATE INDEX idx_email_verification_tokens_active ON email_verification_tokens(token, expires_at) WHERE used_at IS NULL;

-- Comments for email_verification_tokens table
COMMENT ON TABLE email_verification_tokens IS 'Email verification tokens for user email verification';
COMMENT ON COLUMN email_verification_tokens.user_id IS 'User requesting email verification';
COMMENT ON COLUMN email_verification_tokens.token IS 'Unique verification token';
COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Token expiration timestamp';
COMMENT ON COLUMN email_verification_tokens.used_at IS 'Timestamp when token was used (NULL if unused)';

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for meetings table
CREATE TRIGGER update_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for tasks table
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS (Optional - for common queries)
-- ============================================================================
-- View for meeting summary with status
CREATE OR REPLACE VIEW meeting_summary AS
SELECT 
    m.id,
    m.user_id,
    m.title,
    m.upload_date,
    m.duration,
    m.status,
    m.speaker_count,
    m.created_at,
    m.updated_at,
    ps.current_stage,
    ps.overall_progress,
    (SELECT COUNT(*) FROM transcript_segments ts WHERE ts.meeting_id = m.id) as transcript_segment_count,
    (SELECT COUNT(*) FROM tasks t WHERE t.meeting_id = m.id) as task_count,
    (SELECT COUNT(*) FROM decisions d WHERE d.meeting_id = m.id) as decision_count,
    (SELECT COUNT(*) FROM key_points kp WHERE kp.meeting_id = m.id) as key_point_count
FROM meetings m
LEFT JOIN processing_status ps ON ps.meeting_id = m.id;

COMMENT ON VIEW meeting_summary IS 'Summary view of meetings with processing status and entity counts';

-- ============================================================================
-- INITIAL DATA (Optional - for development/testing)
-- ============================================================================
-- No initial data required - application will create data through API

-- ============================================================================
-- GRANTS (Adjust based on your security requirements)
-- ============================================================================
-- Example grants (adjust user/role names as needed):
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

