"""
Database connection and session management module.

This module provides:
- SQLAlchemy engine with connection pooling
- Database session management
- Base class for models
- Database initialization utilities
"""

import os
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool, QueuePool
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration from environment variables
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/meeting_orchestrator"
)

# Connection pool settings
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))  # 1 hour

# Echo SQL queries (set to True for debugging)
ECHO_SQL = os.getenv("DB_ECHO_SQL", "False").lower() == "true"

# Create SQLAlchemy engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_timeout=POOL_TIMEOUT,
    pool_recycle=POOL_RECYCLE,
    echo=ECHO_SQL,
    # PostgreSQL-specific settings
    connect_args={
        "connect_timeout": 10,
        "options": "-c timezone=utc"  # Use UTC timezone
    }
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for declarative models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function for FastAPI to get database session.
    
    Usage in FastAPI routes:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            # Use db session here
            pass
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database by creating all tables.
    
    This should be called after all models are imported.
    In production, use Alembic migrations instead.
    """
    Base.metadata.create_all(bind=engine)


def close_db() -> None:
    """
    Close all database connections.
    Useful for cleanup during application shutdown.
    """
    engine.dispose()


# Optional: Add connection pool event listeners for monitoring
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """Set connection-level settings if needed."""
    # PostgreSQL doesn't need pragma settings like SQLite
    pass


@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    """Log connection checkout events (for debugging)."""
    if ECHO_SQL:
        print(f"Connection checked out from pool: {id(dbapi_conn)}")


@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_conn, connection_record):
    """Log connection checkin events (for debugging)."""
    if ECHO_SQL:
        print(f"Connection checked in to pool: {id(dbapi_conn)}")


# Health check function
def check_db_connection() -> bool:
    """
    Check if database connection is healthy.
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Database connection check failed: {e}")
        return False


if __name__ == "__main__":
    # Test database connection
    print(f"Testing database connection to: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else DATABASE_URL}")
    if check_db_connection():
        print("✅ Database connection successful!")
    else:
        print("❌ Database connection failed!")
        print("\nPlease check:")
        print("1. PostgreSQL is running")
        print("2. DATABASE_URL in .env file is correct")
        print("3. Database exists and user has proper permissions")

