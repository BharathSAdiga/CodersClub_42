"""UDYOGA — Financial Intelligence Engine: Transaction Parser.

Ingests, normalizes, and validates tabular transaction CSV feeds
for alternative credit analysis of credit-invisible MSMEs.
"""

from __future__ import annotations

import csv
import io
import os
import re
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from io import TextIOBase

from pydantic import BaseModel, ConfigDict, Field


class TransactionDirection(str, Enum):
    """Direction of money movement relative to the observed business account."""

    CREDIT = "CREDIT"
    DEBIT = "DEBIT"


class TransactionChannel(str, Enum):
    """Payment settlement rail or instrument."""

    UPI = "UPI"
    NEFT = "NEFT"
    RTGS = "RTGS"
    IMPS = "IMPS"
    CASH_DEPOSIT = "CASH_DEPOSIT"
    CHEQUE = "CHEQUE"
    OTHER = "OTHER"


class TransactionCategory(str, Enum):
    """Classified financial or operational purpose."""

    REVENUE = "REVENUE"
    SUPPLIER_PAYMENT = "SUPPLIER_PAYMENT"
    RENT = "RENT"
    UTILITY = "UTILITY"
    SALARY = "SALARY"
    LOAN_REPAYMENT = "LOAN_REPAYMENT"
    PERSONAL = "PERSONAL"
    OTHER = "OTHER"


class NormalizedTransaction(BaseModel):
    """Deterministic, validated representation of a single financial transaction."""

    transaction_id: str = Field(..., description="Unique transaction reference ID")
    timestamp: datetime = Field(..., description="Settlement datetime")
    amount: Decimal = Field(..., gt=Decimal("0.00"), description="Strictly positive transaction amount in INR")
    direction: TransactionDirection = Field(..., description="CREDIT (inflow) or DEBIT (outflow)")
    channel: TransactionChannel = Field(default=TransactionChannel.OTHER, description="Payment rail")
    category: TransactionCategory = Field(default=TransactionCategory.OTHER, description="Operational purpose")
    counterparty_id: Optional[str] = Field(default=None, description="Identifier of counterparty entity or VPA")
    counterparty_name: Optional[str] = Field(default=None, description="Name of counterparty")
    reference_note: Optional[str] = Field(default=None, description="Narration or bank remarks")
    recurring: Optional[bool] = Field(default=False, description="Whether flagged as a periodic recurring transaction")

    model_config = ConfigDict(frozen=True)


class ValidationIssue(BaseModel):
    """Structured diagnostic entry for validation warnings and rejected rows."""

    row_number: int = Field(..., description="1-based row number in source CSV")
    field: Optional[str] = Field(default=None, description="Target field name")
    raw_value: Optional[str] = Field(default=None, description="Raw input value before parsing")
    issue_type: str = Field(..., description="Machine-readable error/warning category")
    message: str = Field(..., description="Human-readable explanation")


class ParseResult(BaseModel):
    """Comprehensive, internally-consistent output of CSV transaction ingestion."""

    normalized_transactions: List[NormalizedTransaction] = Field(default_factory=list)
    total_rows: int = 0
    valid_rows: int = 0
    invalid_rows: int = 0
    duplicate_rows: int = 0
    validation_warnings: List[ValidationIssue] = Field(default_factory=list)
    validation_errors: List[ValidationIssue] = Field(default_factory=list)


# Standard canonical column name aliases
_COLUMN_ALIASES: Dict[str, str] = {
    "transaction_id": "transaction_id",
    "transactionid": "transaction_id",
    "txnid": "transaction_id",
    "txn_id": "transaction_id",
    "id": "transaction_id",
    "reference_id": "transaction_id",
    "ref_no": "transaction_id",
    "ref_num": "transaction_id",
    "timestamp": "timestamp",
    "date": "timestamp",
    "datetime": "timestamp",
    "txn_date": "timestamp",
    "transaction_date": "timestamp",
    "time": "timestamp",
    "amount": "amount",
    "txn_amount": "amount",
    "transaction_amount": "amount",
    "inr": "amount",
    "value": "amount",
    "direction": "direction",
    "type": "direction",
    "txn_type": "direction",
    "dr_cr": "direction",
    "drcr": "direction",
    "credit_debit": "direction",
    "channel": "channel",
    "payment_channel": "channel",
    "payment_mode": "channel",
    "mode": "channel",
    "rail": "channel",
    "category": "category",
    "txn_category": "category",
    "purpose": "category",
    "tag": "category",
    "counterparty_id": "counterparty_id",
    "counterpartyid": "counterparty_id",
    "party_id": "counterparty_id",
    "vpa": "counterparty_id",
    "account_no": "counterparty_id",
    "account_number": "counterparty_id",
    "counterparty_name": "counterparty_name",
    "counterpartyname": "counterparty_name",
    "party_name": "counterparty_name",
    "merchant_name": "counterparty_name",
    "entity_name": "counterparty_name",
    "reference_note": "reference_note",
    "note": "reference_note",
    "narration": "reference_note",
    "remarks": "reference_note",
    "description": "reference_note",
    "recurring": "recurring",
    "is_recurring": "recurring",
    "repeat": "recurring",
}

# Required columns for ingestion
_REQUIRED_FIELDS: Set[str] = {
    "transaction_id",
    "timestamp",
    "amount",
    "direction",
    "channel",
    "category",
}

# Channel lookup normalization
_CHANNEL_MAP: Dict[str, TransactionChannel] = {
    "UPI": TransactionChannel.UPI,
    "BHIM": TransactionChannel.UPI,
    "GPAY": TransactionChannel.UPI,
    "PHONEPE": TransactionChannel.UPI,
    "PAYTM": TransactionChannel.UPI,
    "NEFT": TransactionChannel.NEFT,
    "RTGS": TransactionChannel.RTGS,
    "IMPS": TransactionChannel.IMPS,
    "CASH_DEPOSIT": TransactionChannel.CASH_DEPOSIT,
    "CASH": TransactionChannel.CASH_DEPOSIT,
    "CHEQUE": TransactionChannel.CHEQUE,
    "CHECK": TransactionChannel.CHEQUE,
    "OTHER": TransactionChannel.OTHER,
}

# Category lookup normalization
_CATEGORY_MAP: Dict[str, TransactionCategory] = {
    "REVENUE": TransactionCategory.REVENUE,
    "SALES": TransactionCategory.REVENUE,
    "CUSTOMER_PAYMENT": TransactionCategory.REVENUE,
    "INFLOW": TransactionCategory.REVENUE,
    "SUPPLIER_PAYMENT": TransactionCategory.SUPPLIER_PAYMENT,
    "SUPPLIER": TransactionCategory.SUPPLIER_PAYMENT,
    "VENDOR_PAYMENT": TransactionCategory.SUPPLIER_PAYMENT,
    "VENDOR": TransactionCategory.SUPPLIER_PAYMENT,
    "RENT": TransactionCategory.RENT,
    "UTILITY": TransactionCategory.UTILITY,
    "ELECTRICITY": TransactionCategory.UTILITY,
    "WATER": TransactionCategory.UTILITY,
    "TELECOM": TransactionCategory.UTILITY,
    "SALARY": TransactionCategory.SALARY,
    "WAGES": TransactionCategory.SALARY,
    "PAYROLL": TransactionCategory.SALARY,
    "LOAN_REPAYMENT": TransactionCategory.LOAN_REPAYMENT,
    "EMI": TransactionCategory.LOAN_REPAYMENT,
    "LOAN": TransactionCategory.LOAN_REPAYMENT,
    "DEBT_SERVICE": TransactionCategory.LOAN_REPAYMENT,
    "PERSONAL": TransactionCategory.PERSONAL,
    "DRAWINGS": TransactionCategory.PERSONAL,
    "OTHER": TransactionCategory.OTHER,
}

# Common datetime parsing patterns
_DATETIME_FORMATS: List[str] = [
    "%Y-%m-%dT%H:%M:%S%z",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%dT%H:%M:%S.%f",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%d %H:%M:%S%z",
    "%Y-%m-%d",
    "%d/%m/%Y %H:%M:%S",
    "%d/%m/%Y %H:%M",
    "%d/%m/%Y",
    "%d-%m-%Y %H:%M:%S",
    "%d-%m-%Y %H:%M",
    "%d-%m-%Y",
    "%m/%d/%Y %H:%M:%S",
    "%m/%d/%Y",
]


def _clean_header_key(raw_header: str) -> str:
    """Cleans BOM, whitespace, quotes, and punctuation from header text."""
    clean = raw_header.strip().lstrip("\ufeff").strip("\"'").lower()
    clean = re.sub(r"[\s\-_]+", "_", clean)
    return _COLUMN_ALIASES.get(clean, clean)


def _parse_timestamp(raw_val: str) -> datetime:
    """Parses timestamps supporting ISO 8601 and Indian banking representations."""
    cleaned = raw_val.strip().strip("\"'")
    if not cleaned:
        raise ValueError("Timestamp string cannot be empty")

    # Try fast native ISO format
    try:
        return datetime.fromisoformat(cleaned)
    except Exception:
        pass

    for fmt in _DATETIME_FORMATS:
        try:
            return datetime.strptime(cleaned, fmt)
        except ValueError:
            continue

    raise ValueError(f"Unrecognized date/time format: '{raw_val}'")


def _parse_amount(raw_val: str) -> Decimal:
    """Cleans currency symbols, commas, and validates strictly positive Decimal."""
    cleaned = raw_val.strip().strip("\"'")
    if not cleaned:
        raise ValueError("Amount cannot be empty")

    # Strip currency signs (₹, Rs., Rs, INR, $) and commas
    cleaned_num = re.sub(r"(?:rs\.?|inr|[₹\$\s,])", "", cleaned, flags=re.IGNORECASE)
    if not cleaned_num:
        raise ValueError(f"Invalid monetary representation: '{raw_val}'")

    try:
        dec = Decimal(cleaned_num)
        if dec.is_nan() or dec.is_infinite():
            raise ValueError(f"Non-finite amount string: '{raw_val}'")
        if dec <= Decimal("0.00"):
            raise ValueError(f"Amount must be strictly positive (> 0.00), got {dec}")
    except InvalidOperation:
        raise ValueError(f"Non-numeric amount string: '{raw_val}'")

    # Standardize to 2 decimal places
    return dec.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _parse_direction(raw_val: str) -> TransactionDirection:
    """Maps direction values into CREDIT or DEBIT."""
    cleaned = raw_val.strip().strip("\"'").upper()
    if cleaned in ("CREDIT", "CR", "C", "INFLOW", "IN"):
        return TransactionDirection.CREDIT
    if cleaned in ("DEBIT", "DR", "D", "OUTFLOW", "OUT"):
        return TransactionDirection.DEBIT
    raise ValueError(f"Invalid transaction direction '{raw_val}'. Expected CREDIT or DEBIT.")


def _parse_channel(raw_val: str) -> Tuple[TransactionChannel, Optional[str]]:
    """Maps payment rail string, defaulting to OTHER with a warning if unlisted."""
    cleaned = raw_val.strip().strip("\"'").upper()
    if not cleaned:
        raise ValueError("Channel cannot be empty")

    if cleaned in _CHANNEL_MAP:
        return _CHANNEL_MAP[cleaned], None

    # Graceful fallback to OTHER with warning
    warning = f"Unrecognized payment channel '{raw_val}'. Normalized to '{TransactionChannel.OTHER.value}'."
    return TransactionChannel.OTHER, warning


def _parse_category(raw_val: str) -> Tuple[TransactionCategory, Optional[str]]:
    """Maps financial purpose, defaulting to OTHER with a warning if unlisted."""
    cleaned = raw_val.strip().strip("\"'").upper()
    if not cleaned:
        raise ValueError("Category cannot be empty")

    if cleaned in _CATEGORY_MAP:
        return _CATEGORY_MAP[cleaned], None

    # Graceful fallback to OTHER with warning
    warning = f"Unrecognized transaction category '{raw_val}'. Normalized to '{TransactionCategory.OTHER.value}'."
    return TransactionCategory.OTHER, warning


def _parse_recurring(raw_val: Any) -> Tuple[Optional[bool], Optional[str]]:
    """Parses optional recurring flag."""
    if raw_val is None:
        return False, None
    s = str(raw_val).strip().strip("\"'").lower()
    if not s or s in ("false", "f", "0", "no", "n"):
        return False, None
    if s in ("true", "t", "1", "yes", "y"):
        return True, None
    warning = f"Ambiguous boolean value '{raw_val}' for recurring flag. Defaulted to False."
    return False, warning


def parse_transactions(source: Union[str, Path, TextIOBase, bytes]) -> ParseResult:
    """Ingests and validates CSV transactions into normalized domain records.

    Args:
        source: A filesystem path (str or Path), raw CSV string, open TextIOBase, or bytes.

    Returns:
        ParseResult containing normalized transactions, counters, warnings, and errors.
    """
    normalized_list: List[NormalizedTransaction] = []
    validation_warnings: List[ValidationIssue] = []
    validation_errors: List[ValidationIssue] = []
    duplicate_rows: int = 0
    invalid_rows: int = 0

    text_stream: Optional[io.StringIO] = None
    file_to_close: Optional[io.TextIOWrapper] = None

    try:
        # 1. Resolve source to an iterable text stream
        if isinstance(source, bytes):
            text_stream = io.StringIO(source.decode("utf-8-sig", errors="replace"))
            reader_stream = text_stream
        elif isinstance(source, Path):
            if not source.exists():
                validation_errors.append(
                    ValidationIssue(
                        row_number=0,
                        issue_type="FILE_NOT_FOUND",
                        message=f"Source file does not exist: {source}",
                    )
                )
                return ParseResult(
                    normalized_transactions=[],
                    total_rows=0,
                    valid_rows=0,
                    invalid_rows=0,
                    duplicate_rows=0,
                    validation_warnings=[],
                    validation_errors=validation_errors,
                )
            file_to_close = open(source, "r", encoding="utf-8-sig", newline="")
            reader_stream = file_to_close
        elif isinstance(source, str):
            # If string is non-empty, has no newlines, and is an existing file on disk, read from file
            if source and not ("\n" in source or "\r" in source) and os.path.isfile(source):
                file_to_close = open(source, "r", encoding="utf-8-sig", newline="")
                reader_stream = file_to_close
            else:
                text_stream = io.StringIO(source)
                reader_stream = text_stream
        elif hasattr(source, "read"):
            reader_stream = source  # type: ignore[assignment]
        else:
            validation_errors.append(
                ValidationIssue(
                    row_number=0,
                    issue_type="UNSUPPORTED_SOURCE_TYPE",
                    message=f"Unsupported source type: {type(source)}",
                )
            )
            return ParseResult(
                normalized_transactions=[],
                total_rows=0,
                valid_rows=0,
                invalid_rows=0,
                duplicate_rows=0,
                validation_warnings=[],
                validation_errors=validation_errors,
            )

        reader = csv.reader(reader_stream)  # type: ignore[arg-type]

        # 2. Extract and validate header row
        try:
            raw_header = next(reader)
        except StopIteration:
            # Completely empty file
            return ParseResult(
                normalized_transactions=[],
                total_rows=0,
                valid_rows=0,
                invalid_rows=0,
                duplicate_rows=0,
                validation_warnings=[],
                validation_errors=[],
            )

        header_indices: Dict[str, int] = {}
        for idx, col in enumerate(raw_header):
            cleaned = _clean_header_key(col)
            if cleaned:
                header_indices[cleaned] = idx

        # Check required columns
        missing_required = _REQUIRED_FIELDS - set(header_indices.keys())
        if missing_required:
            validation_errors.append(
                ValidationIssue(
                    row_number=1,
                    issue_type="MISSING_REQUIRED_HEADERS",
                    message=f"CSV header is missing mandatory columns: {sorted(list(missing_required))}",
                )
            )
            return ParseResult(
                normalized_transactions=[],
                total_rows=0,
                valid_rows=0,
                invalid_rows=0,
                duplicate_rows=0,
                validation_warnings=[],
                validation_errors=validation_errors,
            )

        # 3. Process data rows
        seen_txn_ids: Set[str] = set()
        current_csv_row = 1  # Header was row 1

        for row in reader:
            current_csv_row += 1

            # Skip blank or completely empty lines
            if not row or all(not cell.strip() for cell in row):
                continue

            def get_val(col_name: str) -> Optional[str]:
                idx = header_indices.get(col_name)
                if idx is not None and idx < len(row):
                    val = row[idx].strip()
                    return val if val else None
                return None

            raw_txn_id = get_val("transaction_id")
            raw_ts = get_val("timestamp")
            raw_amount = get_val("amount")
            raw_direction = get_val("direction")
            raw_channel = get_val("channel")
            raw_category = get_val("category")
            raw_cp_id = get_val("counterparty_id")
            raw_cp_name = get_val("counterparty_name")
            raw_note = get_val("reference_note")
            raw_recurring = get_val("recurring")

            # Check for duplicate transaction_id
            if raw_txn_id:
                if raw_txn_id in seen_txn_ids:
                    duplicate_rows += 1
                    validation_errors.append(
                        ValidationIssue(
                            row_number=current_csv_row,
                            field="transaction_id",
                            raw_value=raw_txn_id,
                            issue_type="DUPLICATE_TRANSACTION_ID",
                            message=f"Duplicate transaction_id '{raw_txn_id}' observed at row {current_csv_row}",
                        )
                    )
                    continue

            # Validate required fields presence
            row_errors: List[ValidationIssue] = []
            if not raw_txn_id:
                row_errors.append(
                    ValidationIssue(
                        row_number=current_csv_row,
                        field="transaction_id",
                        raw_value=raw_txn_id,
                        issue_type="MISSING_REQUIRED_FIELD",
                        message="Missing mandatory field 'transaction_id'",
                    )
                )

            parsed_ts: Optional[datetime] = None
            if not raw_ts:
                row_errors.append(
                    ValidationIssue(
                        row_number=current_csv_row,
                        field="timestamp",
                        raw_value=raw_ts,
                        issue_type="MISSING_REQUIRED_FIELD",
                        message="Missing mandatory field 'timestamp'",
                    )
                )
            else:
                try:
                    parsed_ts = _parse_timestamp(raw_ts)
                except ValueError as e:
                    row_errors.append(
                        ValidationIssue(
                            row_number=current_csv_row,
                            field="timestamp",
                            raw_value=raw_ts,
                            issue_type="INVALID_TIMESTAMP",
                            message=str(e),
                        )
                    )

            parsed_amt: Optional[Decimal] = None
            if not raw_amount:
                row_errors.append(
                    ValidationIssue(
                        row_number=current_csv_row,
                        field="amount",
                        raw_value=raw_amount,
                        issue_type="MISSING_REQUIRED_FIELD",
                        message="Missing mandatory field 'amount'",
                    )
                )
            else:
                try:
                    parsed_amt = _parse_amount(raw_amount)
                except ValueError as e:
                    row_errors.append(
                        ValidationIssue(
                            row_number=current_csv_row,
                            field="amount",
                            raw_value=raw_amount,
                            issue_type="INVALID_AMOUNT",
                            message=str(e),
                        )
                    )

            parsed_dir: Optional[TransactionDirection] = None
            if not raw_direction:
                row_errors.append(
                    ValidationIssue(
                        row_number=current_csv_row,
                        field="direction",
                        raw_value=raw_direction,
                        issue_type="MISSING_REQUIRED_FIELD",
                        message="Missing mandatory field 'direction'",
                    )
                )
            else:
                try:
                    parsed_dir = _parse_direction(raw_direction)
                except ValueError as e:
                    row_errors.append(
                        ValidationIssue(
                            row_number=current_csv_row,
                            field="direction",
                            raw_value=raw_direction,
                            issue_type="INVALID_DIRECTION",
                            message=str(e),
                        )
                    )

            parsed_chan: Optional[TransactionChannel] = None
            if not raw_channel:
                row_errors.append(
                    ValidationIssue(
                        row_number=current_csv_row,
                        field="channel",
                        raw_value=raw_channel,
                        issue_type="MISSING_REQUIRED_FIELD",
                        message="Missing mandatory field 'channel'",
                    )
                )
            else:
                try:
                    parsed_chan, chan_warn = _parse_channel(raw_channel)
                    if chan_warn:
                        validation_warnings.append(
                            ValidationIssue(
                                row_number=current_csv_row,
                                field="channel",
                                raw_value=raw_channel,
                                issue_type="CHANNEL_NORMALIZATION",
                                message=chan_warn,
                            )
                        )
                except ValueError as e:
                    row_errors.append(
                        ValidationIssue(
                            row_number=current_csv_row,
                            field="channel",
                            raw_value=raw_channel,
                            issue_type="INVALID_CHANNEL",
                            message=str(e),
                        )
                    )

            parsed_cat: Optional[TransactionCategory] = None
            if not raw_category:
                row_errors.append(
                    ValidationIssue(
                        row_number=current_csv_row,
                        field="category",
                        raw_value=raw_category,
                        issue_type="MISSING_REQUIRED_FIELD",
                        message="Missing mandatory field 'category'",
                    )
                )
            else:
                try:
                    parsed_cat, cat_warn = _parse_category(raw_category)
                    if cat_warn:
                        validation_warnings.append(
                            ValidationIssue(
                                row_number=current_csv_row,
                                field="category",
                                raw_value=raw_category,
                                issue_type="CATEGORY_NORMALIZATION",
                                message=cat_warn,
                            )
                        )
                except ValueError as e:
                    row_errors.append(
                        ValidationIssue(
                            row_number=current_csv_row,
                            field="category",
                            raw_value=raw_category,
                            issue_type="INVALID_CATEGORY",
                            message=str(e),
                        )
                    )

            # Optional recurring flag
            parsed_rec, rec_warn = _parse_recurring(raw_recurring)
            if rec_warn:
                validation_warnings.append(
                    ValidationIssue(
                        row_number=current_csv_row,
                        field="recurring",
                        raw_value=raw_recurring,
                        issue_type="RECURRING_FLAG_WARNING",
                        message=rec_warn,
                    )
                )

            # If any fatal field errors, quarantine row
            if row_errors:
                invalid_rows += 1
                validation_errors.extend(row_errors)
                continue

            # Record is valid!
            assert raw_txn_id is not None
            assert parsed_ts is not None
            assert parsed_amt is not None
            assert parsed_dir is not None
            assert parsed_chan is not None
            assert parsed_cat is not None

            seen_txn_ids.add(raw_txn_id)
            normalized_list.append(
                NormalizedTransaction(
                    transaction_id=raw_txn_id,
                    timestamp=parsed_ts,
                    amount=parsed_amt,
                    direction=parsed_dir,
                    channel=parsed_chan,
                    category=parsed_cat,
                    counterparty_id=raw_cp_id,
                    counterparty_name=raw_cp_name,
                    reference_note=raw_note,
                    recurring=parsed_rec,
                )
            )

    finally:
        if file_to_close is not None:
            file_to_close.close()
        if text_stream is not None:
            text_stream.close()

    valid_rows = len(normalized_list)
    total_rows = valid_rows + invalid_rows + duplicate_rows

    return ParseResult(
        normalized_transactions=normalized_list,
        total_rows=total_rows,
        valid_rows=valid_rows,
        invalid_rows=invalid_rows,
        duplicate_rows=duplicate_rows,
        validation_warnings=validation_warnings,
        validation_errors=validation_errors,
    )
