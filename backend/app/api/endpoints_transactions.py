from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
import io
import csv

from ..schemas.transaction import (
    Transaction,
    TransactionBatchIngest,
    TransactionIngestSummary
)
from ..db import DatabaseBackedTransactionStore

router = APIRouter(prefix="/transactions", tags=["Transactions & Ingestion"])

# Database-backed transaction store (persisted to SQLite)
TRANSACTION_STORE: dict[str, List[Transaction]] = DatabaseBackedTransactionStore()

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB limit

@router.post("/batch", response_model=TransactionIngestSummary)
async def ingest_batch_transactions(batch: TransactionBatchIngest):
    """Programmatic batch ingestion of structured transaction records."""
    if not batch.transactions:
        raise HTTPException(status_code=400, detail="Transaction list cannot be empty")
        
    business_id = batch.business_id
    TRANSACTION_STORE[business_id] = batch.transactions
    
    credits = [t for t in batch.transactions if t.direction == "CREDIT"]
    debits = [t for t in batch.transactions if t.direction == "DEBIT"]
    timestamps = [t.timestamp for t in batch.transactions]
    
    start_date = min(timestamps) if timestamps else None
    end_date = max(timestamps) if timestamps else None
    coverage_days = (end_date - start_date).days if (start_date and end_date) else 0

    return TransactionIngestSummary(
        business_id=business_id,
        total_parsed=len(batch.transactions),
        credits_count=len(credits),
        debits_count=len(debits),
        total_credit_volume=sum((t.amount for t in credits), Decimal("0.0")),
        total_debit_volume=sum((t.amount for t in debits), Decimal("0.0")),
        start_date=start_date,
        end_date=end_date,
        coverage_days=max(coverage_days, 1)
    )

@router.post("/upload-csv", response_model=TransactionIngestSummary)
async def upload_transactions_csv(
    business_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Upload and parse bank/UPI statement CSV for an MSME.
    Expected standard headers: date, amount, direction (CREDIT/DEBIT), channel, counterparty_id, category
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds maximum allowed limit of {MAX_UPLOAD_SIZE // (1024*1024)}MB"
        )

    text = content.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    
    parsed_transactions: List[Transaction] = []
    
    for row in reader:
        try:
            ts_str = row.get("date") or row.get("timestamp") or datetime.utcnow().isoformat()
            try:
                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.utcnow()
                
            amount_val = Decimal(str(row.get("amount", "0.0")))
            if amount_val <= Decimal("0.0"):
                continue
                
            direction = row.get("direction", "CREDIT").upper()
            if direction not in ["CREDIT", "DEBIT"]:
                direction = "CREDIT"
                
            channel = row.get("channel", "UPI_QR").upper()
            if channel not in ["UPI_QR", "NEFT_RTGS", "IMPS", "CASH_DEPOSIT", "CHEQUE", "POS_SWIPE"]:
                channel = "UPI_QR"
                
            category = row.get("category", "CUSTOMER_REVENUE" if direction == "CREDIT" else "SUPPLIER_PURCHASE").upper()
            if category not in [
                "CUSTOMER_REVENUE", "SUPPLIER_PURCHASE", "RENT_UTILITIES", 
                "SALARY_WAGES", "EXISTING_LOAN_EMI", "TAX_STATUTORY", 
                "PROPRIETOR_DRAWING", "UNCATEGORIZED"
            ]:
                category = "UNCATEGORIZED"

            tx = Transaction(
                transaction_id=f"tx_{uuid.uuid4().hex[:10]}",
                business_id=business_id,
                timestamp=ts,
                amount=amount_val,
                direction=direction,
                channel=channel,
                counterparty_id=row.get("counterparty_id"),
                counterparty_name=row.get("counterparty_name", "Undisclosed"),
                category=category,
                narration=row.get("narration")
            )
            parsed_transactions.append(tx)
        except Exception:
            continue

    if not parsed_transactions:
        raise HTTPException(
            status_code=400,
            detail="CSV contains no valid transaction rows. Expected headers: date, amount, direction, channel, counterparty_id, category"
        )

    TRANSACTION_STORE[business_id] = parsed_transactions

    # Audit Trail: Record provenance and SHA-256 fingerprint into evidence repository
    import hashlib
    sha256_hash = hashlib.sha256(content).hexdigest()
    try:
        from ..db import evidence_repo
        evidence_repo.record_evidence(
            business_id=business_id,
            document_name=file.filename,
            document_type="BANK_STATEMENT_CSV",
            provenance="SOURCE_LABELLED",
            record_count=len(parsed_transactions),
            file_hash=sha256_hash
        )
    except Exception:
        pass

    credits = [t for t in parsed_transactions if t.direction == "CREDIT"]
    debits = [t for t in parsed_transactions if t.direction == "DEBIT"]
    timestamps = [t.timestamp for t in parsed_transactions]

    return TransactionIngestSummary(
        business_id=business_id,
        total_parsed=len(parsed_transactions),
        credits_count=len(credits),
        debits_count=len(debits),
        total_credit_volume=sum((t.amount for t in credits), Decimal("0.0")),
        total_debit_volume=sum((t.amount for t in debits), Decimal("0.0")),
        start_date=min(timestamps),
        end_date=max(timestamps),
        coverage_days=max((max(timestamps) - min(timestamps)).days, 1)
    )

@router.get("/summary/{business_id}", response_model=Optional[TransactionIngestSummary])
async def get_transactions_summary(business_id: str):
    """Retrieve existing parsed transactions summary for a business."""
    txs = TRANSACTION_STORE.get(business_id, [])
    if not txs:
        raise HTTPException(status_code=404, detail="No transactions found for business")
    
    credits = [t for t in txs if t.direction == "CREDIT"]
    debits = [t for t in txs if t.direction == "DEBIT"]
    timestamps = [t.timestamp for t in txs]
    return TransactionIngestSummary(
        business_id=business_id,
        total_parsed=len(txs),
        credits_count=len(credits),
        debits_count=len(debits),
        total_credit_volume=sum((t.amount for t in credits), Decimal("0.0")),
        total_debit_volume=sum((t.amount for t in debits), Decimal("0.0")),
        start_date=min(timestamps),
        end_date=max(timestamps),
        coverage_days=max((max(timestamps) - min(timestamps)).days, 1)
    )
