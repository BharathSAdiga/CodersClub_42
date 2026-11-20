"""Unit tests for the Financial Intelligence CSV Transaction Parser.

Verifies deterministic validation, error quarantine, duplicate handling,
currency normalization, and internal count consistency.
"""

import io
from decimal import Decimal
from pathlib import Path
import pytest

from app.modules.financial_intelligence.parser import (
    NormalizedTransaction,
    ParseResult,
    TransactionCategory,
    TransactionChannel,
    TransactionDirection,
    ValidationIssue,
    parse_transactions,
)


SAMPLE_VALID_CSV = """transaction_id,timestamp,amount,direction,channel,category,counterparty_id,counterparty_name,reference_note,recurring
TXN-1001,2026-03-01T10:15:00,15400.00,CREDIT,UPI,REVENUE,CUST-9901,Sri Laxmi Traders,Wholesale payment,false
TXN-1002,2026-03-02T14:30:00,4200.50,DEBIT,NEFT,SUPPLIER_PAYMENT,SUPP-3301,Karnataka Packaging,Carton purchase,false
TXN-1003,2026-03-05T09:00:00,25000.00,DEBIT,IMPS,RENT,LANDLORD-01,Hubli Estate,Monthly shop rent,true
TXN-1004,2026-03-08T18:22:15,350.00,CREDIT,CASH_DEPOSIT,REVENUE,,,Daily counter cash,false
TXN-1005,2026-03-10T12:00:00,1200.00,DEBIT,CHEQUE,UTILITY,HESCOM,Electricity bill,true
"""


def test_parse_valid_csv_complete():
    """Verify parsing a fully compliant synthetic CSV with mixed credits and debits."""
    result = parse_transactions(SAMPLE_VALID_CSV)

    assert isinstance(result, ParseResult)
    assert result.total_rows == 5
    assert result.valid_rows == 5
    assert result.invalid_rows == 0
    assert result.duplicate_rows == 0
    assert len(result.validation_errors) == 0
    assert len(result.normalized_transactions) == 5

    # Check internal count consistency
    assert result.total_rows == result.valid_rows + result.invalid_rows + result.duplicate_rows

    # Verify first transaction
    first = result.normalized_transactions[0]
    assert first.transaction_id == "TXN-1001"
    assert first.amount == Decimal("15400.00")
    assert first.direction == TransactionDirection.CREDIT
    assert first.channel == TransactionChannel.UPI
    assert first.category == TransactionCategory.REVENUE
    assert first.counterparty_id == "CUST-9901"
    assert first.counterparty_name == "Sri Laxmi Traders"
    assert first.reference_note == "Wholesale payment"
    assert first.recurring is False

    # Verify recurring rent payment
    rent = result.normalized_transactions[2]
    assert rent.transaction_id == "TXN-1003"
    assert rent.amount == Decimal("25000.00")
    assert rent.direction == TransactionDirection.DEBIT
    assert rent.category == TransactionCategory.RENT
    assert rent.recurring is True


def test_parse_empty_string():
    """Verify handling of completely empty 0-byte CSV input."""
    result = parse_transactions("")

    assert result.total_rows == 0
    assert result.valid_rows == 0
    assert result.invalid_rows == 0
    assert result.duplicate_rows == 0
    assert len(result.normalized_transactions) == 0
    assert len(result.validation_errors) == 0


def test_parse_header_only_csv():
    """Verify CSV containing only headers returns 0 total rows without error."""
    csv_data = "transaction_id,timestamp,amount,direction,channel,category\n"
    result = parse_transactions(csv_data)

    assert result.total_rows == 0
    assert result.valid_rows == 0
    assert result.invalid_rows == 0
    assert result.duplicate_rows == 0
    assert len(result.normalized_transactions) == 0


def test_parse_missing_required_headers():
    """Verify rejection when mandatory columns (e.g. amount or direction) are absent in header."""
    csv_data = "transaction_id,timestamp,channel,category\nTXN-1,2026-03-01,UPI,REVENUE\n"
    result = parse_transactions(csv_data)

    assert result.total_rows == 0
    assert result.valid_rows == 0
    assert len(result.validation_errors) == 1
    err = result.validation_errors[0]
    assert err.issue_type == "MISSING_REQUIRED_HEADERS"
    assert "amount" in err.message
    assert "direction" in err.message


def test_parse_currency_symbols_and_formatting():
    """Verify stripping of Indian Rupee symbols, commas, and dollar signs."""
    csv_data = """transaction_id,timestamp,amount,direction,channel,category
TXN-C1,2026-03-01T10:00:00,"₹ 1,50,000.50",CREDIT,NEFT,REVENUE
TXN-C2,2026-03-02T11:00:00,"Rs. 4,500.00",DEBIT,UPI,SUPPLIER_PAYMENT
TXN-C3,2026-03-03T12:00:00,"INR 12,000",DEBIT,IMPS,RENT
TXN-C4,2026-03-04T13:00:00,"$750.25",CREDIT,OTHER,REVENUE
"""
    result = parse_transactions(csv_data)

    assert result.valid_rows == 4
    assert result.invalid_rows == 0
    assert result.normalized_transactions[0].amount == Decimal("150000.50")
    assert result.normalized_transactions[1].amount == Decimal("4500.00")
    assert result.normalized_transactions[2].amount == Decimal("12000.00")
    assert result.normalized_transactions[3].amount == Decimal("750.25")


def test_parse_negative_and_zero_amounts_rejected():
    """Verify non-positive amounts are quarantined with explicit row errors."""
    csv_data = """transaction_id,timestamp,amount,direction,channel,category
TXN-NEG,2026-03-01T10:00:00,-500.00,CREDIT,UPI,REVENUE
TXN-ZERO,2026-03-02T10:00:00,0.00,DEBIT,UPI,REVENUE
TXN-VALID,2026-03-03T10:00:00,100.00,CREDIT,UPI,REVENUE
TXN-NAN,2026-03-04T10:00:00,invalid_amt,CREDIT,UPI,REVENUE
"""
    result = parse_transactions(csv_data)

    assert result.total_rows == 4
    assert result.valid_rows == 1
    assert result.invalid_rows == 3
    assert result.duplicate_rows == 0
    assert result.total_rows == result.valid_rows + result.invalid_rows + result.duplicate_rows

    assert len(result.validation_errors) == 3
    err_types = [e.issue_type for e in result.validation_errors]
    assert all(et == "INVALID_AMOUNT" for et in err_types)
    assert result.normalized_transactions[0].transaction_id == "TXN-VALID"


def test_parse_duplicate_transaction_ids():
    """Verify duplicate transaction_ids are quarantined and counted in duplicate_rows."""
    csv_data = """transaction_id,timestamp,amount,direction,channel,category
TXN-DUP-01,2026-03-01T10:00:00,1000.00,CREDIT,UPI,REVENUE
TXN-DUP-01,2026-03-02T11:00:00,2000.00,CREDIT,UPI,REVENUE
TXN-UNIQUE,2026-03-03T12:00:00,3000.00,CREDIT,UPI,REVENUE
TXN-DUP-01,2026-03-04T13:00:00,4000.00,CREDIT,UPI,REVENUE
"""
    result = parse_transactions(csv_data)

    assert result.total_rows == 4
    assert result.valid_rows == 2
    assert result.invalid_rows == 0
    assert result.duplicate_rows == 2
    assert result.total_rows == result.valid_rows + result.invalid_rows + result.duplicate_rows

    dup_errors = [e for e in result.validation_errors if e.issue_type == "DUPLICATE_TRANSACTION_ID"]
    assert len(dup_errors) == 2
    assert dup_errors[0].row_number == 3
    assert dup_errors[1].row_number == 5


def test_parse_datetime_variations_and_indian_formats():
    """Verify date parsing across ISO 8601, DD/MM/YYYY, and DD-MM-YYYY."""
    csv_data = """transaction_id,timestamp,amount,direction,channel,category
TXN-D1,2026-03-15T14:30:00,100.00,CREDIT,UPI,REVENUE
TXN-D2,2026-03-16,200.00,CREDIT,UPI,REVENUE
TXN-D3,17/03/2026 15:45:00,300.00,CREDIT,UPI,REVENUE
TXN-D4,18/03/2026,400.00,CREDIT,UPI,REVENUE
TXN-D5,19-03-2026 09:10:00,500.00,CREDIT,UPI,REVENUE
TXN-D6,invalid-date-string,600.00,CREDIT,UPI,REVENUE
"""
    result = parse_transactions(csv_data)

    assert result.total_rows == 6
    assert result.valid_rows == 5
    assert result.invalid_rows == 1
    assert result.duplicate_rows == 0
    assert result.total_rows == result.valid_rows + result.invalid_rows + result.duplicate_rows

    txns = result.normalized_transactions
    assert txns[0].timestamp.year == 2026 and txns[0].timestamp.day == 15
    assert txns[1].timestamp.year == 2026 and txns[1].timestamp.day == 16
    assert txns[2].timestamp.day == 17 and txns[2].timestamp.month == 3
    assert txns[3].timestamp.day == 18 and txns[3].timestamp.month == 3
    assert txns[4].timestamp.day == 19 and txns[4].timestamp.month == 3

    err = result.validation_errors[0]
    assert err.row_number == 7
    assert err.issue_type == "INVALID_TIMESTAMP"


def test_parse_unknown_category_and_channel_graceful():
    """Verify unknown categories and channels default to OTHER with diagnostic warnings."""
    csv_data = """transaction_id,timestamp,amount,direction,channel,category
TXN-U1,2026-03-01T10:00:00,500.00,CREDIT,STRIPE_ONLINE,CRYPTO_PAYMENT
"""
    result = parse_transactions(csv_data)

    assert result.total_rows == 1
    assert result.valid_rows == 1
    assert result.invalid_rows == 0
    txn = result.normalized_transactions[0]
    assert txn.channel == TransactionChannel.OTHER
    assert txn.category == TransactionCategory.OTHER

    assert len(result.validation_warnings) == 2
    warning_types = [w.issue_type for w in result.validation_warnings]
    assert "CHANNEL_NORMALIZATION" in warning_types
    assert "CATEGORY_NORMALIZATION" in warning_types


def test_parse_direction_variations():
    """Verify case-insensitivity and shorthand aliases for CREDIT and DEBIT."""
    csv_data = """transaction_id,timestamp,amount,direction,channel,category
T1,2026-03-01T10:00:00,100.00,credit,UPI,REVENUE
T2,2026-03-02T10:00:00,200.00,Cr,UPI,REVENUE
T3,2026-03-03T10:00:00,300.00,DEBIT,UPI,REVENUE
T4,2026-03-04T10:00:00,400.00,dr,UPI,REVENUE
T5,2026-03-05T10:00:00,500.00,INVALID_DIR,UPI,REVENUE
"""
    result = parse_transactions(csv_data)

    assert result.total_rows == 5
    assert result.valid_rows == 4
    assert result.invalid_rows == 1

    assert result.normalized_transactions[0].direction == TransactionDirection.CREDIT
    assert result.normalized_transactions[1].direction == TransactionDirection.CREDIT
    assert result.normalized_transactions[2].direction == TransactionDirection.DEBIT
    assert result.normalized_transactions[3].direction == TransactionDirection.DEBIT

    err = result.validation_errors[0]
    assert err.row_number == 6
    assert err.issue_type == "INVALID_DIRECTION"


def test_parse_missing_required_data_fields():
    """Verify rows with missing required cells are rejected with exact row numbers."""
    csv_data = """transaction_id,timestamp,amount,direction,channel,category
,2026-03-01T10:00:00,100.00,CREDIT,UPI,REVENUE
TXN-M2,,200.00,CREDIT,UPI,REVENUE
TXN-M3,2026-03-03T10:00:00,,CREDIT,UPI,REVENUE
TXN-M4,2026-03-04T10:00:00,400.00,,UPI,REVENUE
TXN-M5,2026-03-05T10:00:00,500.00,CREDIT,,REVENUE
TXN-M6,2026-03-06T10:00:00,600.00,CREDIT,UPI,
TXN-OK,2026-03-07T10:00:00,700.00,CREDIT,UPI,REVENUE
"""
    result = parse_transactions(csv_data)

    assert result.total_rows == 7
    assert result.valid_rows == 1
    assert result.invalid_rows == 6
    assert result.duplicate_rows == 0
    assert result.total_rows == result.valid_rows + result.invalid_rows + result.duplicate_rows
    assert len(result.validation_errors) == 6

    # Verify rows 2 through 7 failed, row 8 succeeded
    failed_rows = [e.row_number for e in result.validation_errors]
    assert failed_rows == [2, 3, 4, 5, 6, 7]
    assert result.normalized_transactions[0].transaction_id == "TXN-OK"


def test_parse_from_file_path(tmp_path: Path):
    """Verify parse_transactions accepts a filesystem Path object."""
    file_path = tmp_path / "test_statement.csv"
    file_path.write_text(SAMPLE_VALID_CSV, encoding="utf-8")

    result = parse_transactions(file_path)
    assert result.total_rows == 5
    assert result.valid_rows == 5


def test_parse_missing_file_graceful():
    """Verify passing a non-existent file path returns structured error without unhandled exception."""
    missing_path = Path("/tmp/non_existent_statement_12345.csv")
    result = parse_transactions(missing_path)

    assert result.total_rows == 0
    assert result.valid_rows == 0
    assert len(result.validation_errors) == 1
    assert result.validation_errors[0].issue_type == "FILE_NOT_FOUND"


def test_parse_bytes_with_utf8_bom():
    """Verify binary bytes with UTF-8 BOM are handled seamlessly."""
    bom_csv = "\ufeff" + SAMPLE_VALID_CSV
    bytes_data = bom_csv.encode("utf-8")

    result = parse_transactions(bytes_data)
    assert result.total_rows == 5
    assert result.valid_rows == 5


def test_parse_text_io_stream():
    """Verify parsing from an open io.StringIO stream."""
    stream = io.StringIO(SAMPLE_VALID_CSV)
    result = parse_transactions(stream)

    assert result.total_rows == 5
    assert result.valid_rows == 5


def test_parse_blank_lines_ignored():
    """Verify whitespace and empty rows do not inflate row counts."""
    csv_with_blanks = """transaction_id,timestamp,amount,direction,channel,category
TXN-1,2026-03-01T10:00:00,100.00,CREDIT,UPI,REVENUE

   
TXN-2,2026-03-02T10:00:00,200.00,DEBIT,UPI,REVENUE
"""
    result = parse_transactions(csv_with_blanks)

    assert result.total_rows == 2
    assert result.valid_rows == 2
    assert result.invalid_rows == 0
    assert result.duplicate_rows == 0


def test_parse_recurring_flag_variations():
    """Verify boolean normalization for the recurring flag across formats."""
    csv_data = """transaction_id,timestamp,amount,direction,channel,category,recurring
TXN-R1,2026-03-01T10:00:00,100.00,CREDIT,UPI,REVENUE,yes
TXN-R2,2026-03-02T10:00:00,200.00,CREDIT,UPI,REVENUE,1
TXN-R3,2026-03-03T10:00:00,300.00,CREDIT,UPI,REVENUE,no
TXN-R4,2026-03-04T10:00:00,400.00,CREDIT,UPI,REVENUE,0
TXN-R5,2026-03-05T10:00:00,500.00,CREDIT,UPI,REVENUE,maybe_recurring
"""
    result = parse_transactions(csv_data)

    assert result.valid_rows == 5
    txns = result.normalized_transactions
    assert txns[0].recurring is True
    assert txns[1].recurring is True
    assert txns[2].recurring is False
    assert txns[3].recurring is False
    assert txns[4].recurring is False  # Ambiguous string defaults to False

    # Ambiguous value generates warning
    assert len(result.validation_warnings) == 1
    assert result.validation_warnings[0].issue_type == "RECURRING_FLAG_WARNING"


def test_parse_header_aliases():
    """Verify header alias mappings (TxnID, Date, INR, Type, Rail, Purpose)."""
    csv_data = """TxnID,Date,INR,Type,Rail,Purpose
TXN-A1,2026-03-01,1500.00,CR,UPI,REVENUE
TXN-A2,2026-03-02,2500.00,DR,IMPS,SUPPLIER_PAYMENT
"""
    result = parse_transactions(csv_data)

    assert result.valid_rows == 2
    assert result.invalid_rows == 0
    assert result.normalized_transactions[0].transaction_id == "TXN-A1"
    assert result.normalized_transactions[0].direction == TransactionDirection.CREDIT
    assert result.normalized_transactions[1].direction == TransactionDirection.DEBIT


def test_parse_internal_count_consistency_mixed_batch():
    """Verify that total_rows strictly equals valid_rows + invalid_rows + duplicate_rows."""
    csv_data = """transaction_id,timestamp,amount,direction,channel,category
TXN-V1,2026-03-01T10:00:00,100.00,CREDIT,UPI,REVENUE
TXN-V2,2026-03-02T10:00:00,200.00,CREDIT,UPI,REVENUE
TXN-V1,2026-03-03T10:00:00,300.00,CREDIT,UPI,REVENUE
TXN-INV1,invalid_date,400.00,CREDIT,UPI,REVENUE
TXN-INV2,2026-03-05T10:00:00,-500.00,CREDIT,UPI,REVENUE
TXN-V3,2026-03-06T10:00:00,600.00,DEBIT,NEFT,RENT
TXN-V2,2026-03-07T10:00:00,700.00,DEBIT,NEFT,RENT
"""
    result = parse_transactions(csv_data)

    assert result.total_rows == 7
    assert result.valid_rows == 3
    assert result.invalid_rows == 2
    assert result.duplicate_rows == 2
    assert result.total_rows == result.valid_rows + result.invalid_rows + result.duplicate_rows


def test_parse_unsupported_source_type():
    """Verify passing an unsupported type returns a structured error."""
    result = parse_transactions(12345)  # type: ignore[arg-type]

    assert result.total_rows == 0
    assert len(result.validation_errors) == 1
    assert result.validation_errors[0].issue_type == "UNSUPPORTED_SOURCE_TYPE"

