from pydantic import BaseModel, Field, model_validator
from typing import Optional, Literal, List, Set
from datetime import datetime
from decimal import Decimal

# Category to Direction constraints
CATEGORY_DIRECTION_MAP = {
    "CUSTOMER_REVENUE": "CREDIT",
    "SUPPLIER_PURCHASE": "DEBIT",
    "RENT_UTILITIES": "DEBIT",
    "SALARY_WAGES": "DEBIT",
    "EXISTING_LOAN_EMI": "DEBIT",
    "TAX_STATUTORY": "DEBIT",
    "PROPRIETOR_DRAWING": "DEBIT",
}

class Transaction(BaseModel):
    """Normalized atomic transaction record across UPI, bank, or ledger."""
    transaction_id: str
    business_id: str
    timestamp: datetime
    amount: Decimal = Field(..., gt=Decimal("0.0"), description="Absolute monetary transaction value in INR")
    direction: Literal["CREDIT", "DEBIT"]
    channel: Literal["UPI_QR", "NEFT_RTGS", "IMPS", "CASH_DEPOSIT", "CHEQUE", "POS_SWIPE"]
    counterparty_id: Optional[str] = Field(default=None, description="Anonymized or raw counterparty id (optional when unidentified or cash)")
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

    @model_validator(mode="after")
    def validate_direction_and_category(self) -> "Transaction":
        expected_direction = CATEGORY_DIRECTION_MAP.get(self.category)
        if expected_direction and self.direction != expected_direction:
            raise ValueError(
                f"Invalid transaction direction '{self.direction}' for category '{self.category}'. "
                f"Expected direction '{expected_direction}'."
            )
        return self

class TransactionBatchIngest(BaseModel):
    business_id: str
    source_name: str = Field(default="bank_statement_csv")
    transactions: List[Transaction]

    @model_validator(mode="after")
    def validate_batch_uniqueness(self) -> "TransactionBatchIngest":
        seen_ids: Set[str] = set()
        duplicates: List[str] = []
        for tx in self.transactions:
            if tx.transaction_id in seen_ids:
                duplicates.append(tx.transaction_id)
            else:
                seen_ids.add(tx.transaction_id)
        if duplicates:
            raise ValueError(f"Duplicate transaction IDs detected in batch: {sorted(list(set(duplicates)))}")
        return self

class TransactionIngestSummary(BaseModel):
    business_id: str
    total_parsed: int
    credits_count: int
    debits_count: int
    total_credit_volume: Decimal = Field(default=Decimal("0.0"))
    total_debit_volume: Decimal = Field(default=Decimal("0.0"))
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    coverage_days: int = 0
