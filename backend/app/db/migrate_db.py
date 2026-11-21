"""
UDYOGA Database Migration & Initialization Utility
Safely initializes tables, validates SQLite WAL and foreign key settings,
and seeds initial demo profiles without destructive operations.
"""
import sys
import os
import argparse
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from backend.app.db.session import engine, SessionLocal, Base
from backend.app.db.repositories import init_db
from backend.app.db.models import *

def check_db_health():
    """Inspects SQLite schema, pragmas, and existing records."""
    print("=" * 60)
    print("UDYOGA Database Health & Migration Inspection")
    print("=" * 60)
    
    with engine.connect() as conn:
        journal_mode = conn.execute(text("PRAGMA journal_mode;")).scalar()
        foreign_keys = conn.execute(text("PRAGMA foreign_keys;")).scalar()
        busy_timeout = conn.execute(text("PRAGMA busy_timeout;")).scalar()
        
        print(f"Engine URL:       {engine.url}")
        print(f"Journal Mode:     {journal_mode} (Expected: wal)")
        print(f"Foreign Keys:     {foreign_keys} (Expected: 1)")
        print(f"Busy Timeout:     {busy_timeout} ms (Expected: >= 5000)")
        
        table_names = set(Base.metadata.tables.keys())
        print(f"\nRegistered ORM Tables ({len(table_names)}):")
        for tbl in sorted(table_names):
            try:
                count = conn.execute(text(f"SELECT COUNT(*) FROM {tbl};")).scalar()
                print(f"  - {tbl:<20} : {count} rows")
            except Exception as e:
                print(f"  - {tbl:<20} : NOT CREATED ({e})")
    print("=" * 60)

def main():
    parser = argparse.ArgumentParser(description="UDYOGA Database Management CLI")
    parser.add_argument("--init", action="store_true", help="Initialize tables and seed initial demo data safely")
    parser.add_argument("--status", action="store_true", help="Check database pragmas, tables, and row counts")
    args = parser.parse_args()

    if args.init:
        print("Initializing tables and seeding demo accounts...")
        init_db()
        print("Initialization completed successfully.")
        check_db_health()
    elif args.status:
        check_db_health()
    else:
        # Default behavior: run status
        check_db_health()

if __name__ == "__main__":
    main()
