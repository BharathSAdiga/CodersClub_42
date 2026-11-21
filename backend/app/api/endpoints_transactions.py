from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List, Set
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
import io
import csv
import re
import hashlib

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

def parse_date_flexible(val: str) -> datetime:
    """Parses date string supporting ISO, DD-MM-YYYY, DD/MM/YYYY, MM/DD/YYYY, and variations."""
    cleaned = val.strip().replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(cleaned)
    except Exception:
        pass
    for fmt in (
        "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y",
        "%Y/%m/%d", "%d-%b-%Y", "%d-%B-%Y", "%d/%b/%Y",
        "%Y-%m-%d %H:%M:%S", "%d-%m-%Y %H:%M:%S", "%d/%m/%Y %H:%M:%S"
    ):
        try:
            return datetime.strptime(cleaned, fmt)
        except Exception:
            continue
    return datetime.utcnow()

@router.post("/upload-csv", response_model=TransactionIngestSummary)
async def upload_transactions_csv(
    business_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Upload and parse bank/UPI statement CSV for an MSME.
    Supports multiple standard formats:
      1. Normalized: Date, Description, Amount, Type (or direction), Balance
      2. Bank Statement: Date, Description, Debit, Credit, Balance
      3. Bank Ledger: Date, Narration, Debit, Credit, Balance
      4. Standard UDYOGA: date, amount, direction, channel, counterparty_id, category, narration
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
    seen_tx_ids: Set[str] = set()

    for raw_row in reader:
        try:
            # Normalize keys: lowercase and strip whitespace
            row = {str(k).strip().lower(): str(v).strip() for k, v in raw_row.items() if k is not None}
            if not row or all(not v for v in row.values()):
                continue

            # 1. Date extraction
            date_str = (
                row.get("date") or row.get("timestamp") or row.get("txn_date") or
                row.get("transaction_date") or row.get("datetime") or row.get("value_date") or ""
            )
            ts = parse_date_flexible(date_str) if date_str else datetime.utcnow()

            # 2. Amount and Direction extraction
            amount_val: Optional[Decimal] = None
            direction: Optional[str] = None

            def clean_num(s: str) -> Optional[Decimal]:
                s_clean = re.sub(r"[^\d.-]", "", s)
                if not s_clean or s_clean == "-" or s_clean == ".":
                    return None
                try:
                    d = Decimal(s_clean)
                    return abs(d) if d != Decimal("0.0") else None
                except Exception:
                    return None

            # Check separate Debit and Credit columns first
            debit_val_str = row.get("debit") or row.get("withdrawal") or row.get("debit amount") or row.get("dr") or ""
            credit_val_str = row.get("credit") or row.get("deposit") or row.get("credit amount") or row.get("cr") or ""

            debit_amt = clean_num(debit_val_str)
            credit_amt = clean_num(credit_val_str)

            if credit_amt is not None and credit_amt > Decimal("0.0"):
                amount_val = credit_amt
                direction = "CREDIT"
            elif debit_amt is not None and debit_amt > Decimal("0.0"):
                amount_val = debit_amt
                direction = "DEBIT"
            else:
                # Single amount column
                amt_str = (
                    row.get("amount") or row.get("txn_amount") or
                    row.get("transaction_amount") or row.get("value") or row.get("inr") or ""
                )
                amt_clean = re.sub(r"[^\d.-]", "", amt_str)
                if not amt_clean:
                    continue
                raw_amt = Decimal(amt_clean)
                if raw_amt == Decimal("0.0"):
                    continue

                type_str = (
                    row.get("type") or row.get("direction") or row.get("txn_type") or
                    row.get("dr_cr") or row.get("drcr") or ""
                ).upper()

                if raw_amt < Decimal("0.0"):
                    amount_val = abs(raw_amt)
                    direction = "DEBIT"
                elif type_str in ["DEBIT", "DR", "WITHDRAWAL", "OUTFLOW"]:
                    amount_val = abs(raw_amt)
                    direction = "DEBIT"
                elif type_str in ["CREDIT", "CR", "DEPOSIT", "INFLOW"]:
                    amount_val = abs(raw_amt)
                    direction = "CREDIT"
                else:
                    amount_val = abs(raw_amt)
                    direction = "CREDIT" if raw_amt > Decimal("0.0") else "DEBIT"

            if amount_val is None or amount_val <= Decimal("0.0"):
                continue

            # 3. Narration / Description extraction
            narration = (
                row.get("description") or row.get("narration") or
                row.get("particulars") or row.get("remarks") or
                row.get("reference_note") or row.get("note") or ""
            )

            # 4. Channel inference
            channel_raw = (row.get("channel") or row.get("payment_channel") or row.get("mode") or "").upper()
            if channel_raw in ["UPI_QR", "NEFT_RTGS", "IMPS", "CASH_DEPOSIT", "CHEQUE", "POS_SWIPE"]:
                channel = channel_raw
            else:
                narr_upper = narration.upper()
                if any(k in narr_upper for k in ["UPI", "QR", "PHONEPE", "GPAY", "PAYTM"]):
                    channel = "UPI_QR"
                elif any(k in narr_upper for k in ["POS", "CARD", "SWIPE"]):
                    channel = "POS_SWIPE"
                elif "IMPS" in narr_upper:
                    channel = "IMPS"
                elif "NEFT" in narr_upper or "RTGS" in narr_upper:
                    channel = "NEFT_RTGS"
                elif "CASH" in narr_upper:
                    channel = "CASH_DEPOSIT"
                elif "CHEQUE" in narr_upper or "CHQ" in narr_upper:
                    channel = "CHEQUE"
                else:
                    channel = "UPI_QR" if direction == "CREDIT" else "IMPS"

            # 5. Category inference strictly respecting direction constraints
            if direction == "CREDIT":
                category = "CUSTOMER_REVENUE"
            else:
                narr_upper = narration.upper()
                if any(k in narr_upper for k in ["LOAN", "EMI", "INSTALLMENT", "REPAYMENT"]):
                    category = "EXISTING_LOAN_EMI"
                elif any(k in narr_upper for k in ["RENT", "LEASE", "ELECTRICITY", "POWER", "BESCOM", "UTILITY", "EXPENSE", "BILL"]):
                    category = "RENT_UTILITIES"
                elif any(k in narr_upper for k in ["SALARY", "WAGES", "PAYROLL"]):
                    category = "SALARY_WAGES"
                elif any(k in narr_upper for k in ["TAX", "GST", "TDS"]):
                    category = "TAX_STATUTORY"
                elif any(k in narr_upper for k in ["DRAWING", "PERSONAL"]):
                    category = "PROPRIETOR_DRAWING"
                else:
                    category = "SUPPLIER_PURCHASE"

            # 6. Counterparty identification
            cp_id = row.get("counterparty_id") or row.get("vpa") or row.get("party_id")
            cp_name = row.get("counterparty_name") or row.get("party_name") or row.get("merchant_name") or "Undisclosed"
            if cp_name == "Undisclosed" and narration:
                cp_name = narration[:40]

            # 7. Deterministic deduplication ID
            hash_src = f"{business_id}_{ts.strftime('%Y%m%d%H%M%S')}_{amount_val:.2f}_{direction}_{narration}"
            tx_id = f"tx_{hashlib.sha256(hash_src.encode()).hexdigest()[:12]}"
            if tx_id in seen_tx_ids:
                continue
            seen_tx_ids.add(tx_id)

            tx = Transaction(
                transaction_id=tx_id,
                business_id=business_id,
                timestamp=ts,
                amount=amount_val,
                direction=direction,
                channel=channel,
                counterparty_id=cp_id,
                counterparty_name=cp_name,
                category=category,
                narration=narration or None
            )
            parsed_transactions.append(tx)
        except Exception:
            continue

    if not parsed_transactions:
        raise HTTPException(
            status_code=400,
            detail="CSV contains no valid transaction rows. Expected headers: Date, Description/Narration, and either (Debit, Credit) or (Amount, Type)"
        )

    TRANSACTION_STORE[business_id] = parsed_transactions

    # Audit Trail: Record provenance and SHA-256 fingerprint into evidence repository
    sha256_hash = hashlib.sha256(content).hexdigest()
    try:
        from ..db import evidence_repo, audit_repo
        evidence_repo.record_evidence(
            business_id=business_id,
            document_name=file.filename,
            document_type="BANK_STATEMENT_CSV",
            provenance="SOURCE_LABELLED",
            provenance_category="USER_UPLOADED",
            source_type="FILE_UPLOAD",
            source_name=file.filename,
            verification_status="PENDING",
            record_count=len(parsed_transactions),
            file_hash=sha256_hash,
            confidence_score=0.65
        )
        audit_repo.log_access(
            user_id="user_uploader",
            role="BORROWER",
            business_id=business_id,
            resource_type="FINANCIAL_DOCUMENT",
            action="DOCUMENT_UPLOAD",
            details=f"Uploaded bank statement CSV '{file.filename}' containing {len(parsed_transactions)} transactions.",
            outcome="SUCCESS",
            structured_metadata={
                "filename": file.filename,
                "file_hash": sha256_hash,
                "record_count": len(parsed_transactions),
                "provenance": "USER_UPLOADED"
            }
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
