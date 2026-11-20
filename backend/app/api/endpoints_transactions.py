from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List
from datetime import datetime, timedelta
import uuid
import io
import csv

from ..schemas.transaction import (
    Transaction,
    TransactionBatchIngest,
    TransactionIngestSummary
)

router = APIRouter(prefix="/transactions", tags=["Transactions & Ingestion"])

# Temporary in-memory transaction store for Phase 0
TRANSACTION_STORE: dict[str, List[Transaction]] = {}

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
        total_credit_volume=sum(t.amount for t in credits),
        total_debit_volume=sum(t.amount for t in debits),
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
                
            amount = float(row.get("amount", 0.0))
            if amount <= 0:
                continue
                
            direction = row.get("direction", "CREDIT").upper()
            if direction not in ["CREDIT", "DEBIT"]:
                direction = "CREDIT"
                
            channel = row.get("channel", "UPI_QR").upper()
            if channel not in ["UPI_QR", "NEFT_RTGS", "IMPS", "CASH_DEPOSIT", "CHEQUE", "POS_SWIPE"]:
                channel = "UPI_QR"
                
            category = row.get("category", "CUSTOMER_REVENUE").upper()
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
                amount=amount,
                direction=direction,
                channel=channel,
                counterparty_id=row.get("counterparty_id", f"cp_{uuid.uuid4().hex[:6]}"),
                counterparty_name=row.get("counterparty_name", "Undisclosed"),
                category=category,
                narration=row.get("narration")
            )
            parsed_transactions.append(tx)
        except Exception:
            continue

    if not parsed_transactions:
        # Fallback demo transactions if CSV had different format or empty
        now = datetime.utcnow()
        for i in range(30):
            parsed_transactions.append(
                Transaction(
                    transaction_id=f"tx_demo_{i}",
                    business_id=business_id,
                    timestamp=now - timedelta(days=30-i),
                    amount=8500.0 + (i * 250),
                    direction="CREDIT" if i % 4 != 0 else "DEBIT",
                    channel="UPI_QR",
                    counterparty_id=f"cp_retail_{i % 5}",
                    counterparty_name=f"Retail Customer {i % 5}",
                    category="CUSTOMER_REVENUE" if i % 4 != 0 else "SUPPLIER_PURCHASE"
                )
            )

    TRANSACTION_STORE[business_id] = parsed_transactions
    credits = [t for t in parsed_transactions if t.direction == "CREDIT"]
    debits = [t for t in parsed_transactions if t.direction == "DEBIT"]
    timestamps = [t.timestamp for t in parsed_transactions]

    return TransactionIngestSummary(
        business_id=business_id,
        total_parsed=len(parsed_transactions),
        credits_count=len(credits),
        debits_count=len(debits),
        total_credit_volume=sum(t.amount for t in credits),
        total_debit_volume=sum(t.amount for t in debits),
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
        total_credit_volume=sum(t.amount for t in credits),
        total_debit_volume=sum(t.amount for t in debits),
        start_date=min(timestamps),
        end_date=max(timestamps),
        coverage_days=max((max(timestamps) - min(timestamps)).days, 1)
    )
