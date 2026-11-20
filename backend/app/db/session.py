import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from ..core.config import settings

# Database file location
DB_URL = os.getenv("DATABASE_URL", "sqlite:///./udyoga.db")
# Ensure standard SQLite prefix for sync SQLAlchemy
if DB_URL.startswith("sqlite+aiosqlite://"):
    DB_URL = DB_URL.replace("sqlite+aiosqlite://", "sqlite://")

engine = create_engine(
    DB_URL,
    connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {},
    pool_pre_ping=True
)

# Enable SQLite WAL mode, foreign keys, and 5-second busy timeout for safe concurrent agent reads/writes
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if DB_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA busy_timeout=5000")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)
Base = declarative_base()

def get_db():
    """FastAPI dependency for thread-safe database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_custom_engine(custom_db_url: str):
    """Creates an isolated engine for testing or custom paths with identical WAL and foreign key pragmas."""
    if custom_db_url.startswith("sqlite+aiosqlite://"):
        custom_db_url = custom_db_url.replace("sqlite+aiosqlite://", "sqlite://")
    eng = create_engine(
        custom_db_url,
        connect_args={"check_same_thread": False} if custom_db_url.startswith("sqlite") else {},
        pool_pre_ping=True
    )
    @event.listens_for(eng, "connect")
    def set_custom_pragmas(dbapi_conn, record):
        if custom_db_url.startswith("sqlite"):
            cur = dbapi_conn.cursor()
            cur.execute("PRAGMA journal_mode=WAL")
            cur.execute("PRAGMA foreign_keys=ON")
            cur.execute("PRAGMA busy_timeout=5000")
            cur.close()
    return eng

def get_session_factory(custom_engine):
    """Returns an expire_on_commit=False session factory bound to the specified engine."""
    return sessionmaker(autocommit=False, autoflush=False, bind=custom_engine, expire_on_commit=False)
