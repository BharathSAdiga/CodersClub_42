import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from backend.app.main import app
from backend.app.db.session import engine

client = TestClient(app)

def test_request_correlation_id_auto_generation():
    """Verify that every response receives an auto-generated X-Correlation-ID header."""
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    cid = resp.headers.get("X-Correlation-ID")
    assert cid is not None
    assert cid.startswith("corr_")

def test_request_correlation_id_propagation():
    """Verify that incoming X-Correlation-ID headers are preserved and propagated back."""
    custom_cid = "corr_custom_trace_998877"
    resp = client.get("/api/v1/health", headers={"X-Correlation-ID": custom_cid})
    assert resp.status_code == 200
    assert resp.headers.get("X-Correlation-ID") == custom_cid

def test_rfc7807_error_envelope_structure():
    """Verify that error responses follow the RFC-7807 problem details specification."""
    resp = client.get("/api/v1/business/non_existent_msme_id_9999")
    assert resp.status_code == 404
    data = resp.json()
    assert "type" in data
    assert "title" in data
    assert "status" in data
    assert data["status"] == 404
    assert "detail" in data
    assert "correlation_id" in data
    assert len(data["correlation_id"]) > 5

def test_sqlite_wal_mode_and_concurrency_settings():
    """Verify that SQLite engine is running in WAL (Write-Ahead Logging) mode with foreign keys enabled."""
    with engine.connect() as conn:
        journal_mode = conn.execute(text("PRAGMA journal_mode;")).scalar()
        assert str(journal_mode).lower() == "wal"

        foreign_keys = conn.execute(text("PRAGMA foreign_keys;")).scalar()
        assert foreign_keys == 1

        busy_timeout = conn.execute(text("PRAGMA busy_timeout;")).scalar()
        assert busy_timeout >= 5000
