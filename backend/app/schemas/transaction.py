from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime

class Transaction(BaseModel):
    """Normalized atomic transaction record across UPI, bank, or ledger."""
    transaction_id: str
    business_id: str
    timestamp: datetime
    amount: float = Field(..., gt=0.0, description="Absolute transaction value in INR")
    direction: Literal["CREDIT", "DEBIT"]
    channel: Literal["UPI_QR", "NEFT_RTGS", "IMPS", "CASH_DEPOSIT", "CHEQUE", "POS_SWIPE"]
    counterparty_id: str = Field(..., description="Anonymized or raw counterparty id")
    counterparty_name: Optional[str] = "Undisclosed"
    category: Literal[
        "CUSTOMER_REVENUE",
        "SUPPLIER_PURCHASE",
        "RENT_UTILITIES",
        "SALARY_WAGES",
        "EXISTING_LOAN_EMI",
        "TAX_STATUTORY",
        "PROPRIETOR_DRAWING",
        "UNCATEGORIZED"
    ]
    narration: Optional[str] = None
    is_recurring: bool = False

class TransactionBatchIngest(BaseModel):
    business_id: str
    source_name: str = Field(default="bank_statement_csv")
    transactions: List[Transaction]

class TransactionIngestSummary(BaseModel):
    business_id: str
    total_parsed: int
    credits_count: int
    debits_count: int
    total_credit_volume: float
    total_debit_volume: float
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    coverage_days: int
