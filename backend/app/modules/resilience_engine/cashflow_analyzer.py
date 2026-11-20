from typing import List, Optional, Dict, Any
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
from ...schemas.transaction import Transaction

def round_curr(val: Decimal) -> Decimal:
    """Helper to quantize currency to two decimal places."""
    return val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def reconstruct_monthly_cashflow(
    transactions: Optional[List[Transaction]] = None,
    declared_monthly_turnover: Decimal = Decimal("0.0"),
    operating_expense_ratio: Decimal = Decimal("0.72")
) -> Dict[str, Any]:
    """
    Reconstructs operating inflows, expenses, and net operating cashflow.
    
    If transactions are provided, groups credits by month and calculates actual empirical operating expenses.
    If only declared profile is provided, applies conservative sectoral expense ratios without inventing missing line items.
    
    Returns a dictionary containing:
        - monthly_operating_inflow: Decimal
        - monthly_operating_expenses: Decimal
        - net_operating_surplus_pre_debt: Decimal
        - monthly_breakdown: List[Dict]
        - is_empirical: bool
    """
    if transactions and len(transactions) > 0:
        # Reconstruct empirical monthly cash flows
        month_buckets: Dict[str, Dict[str, Decimal]] = {}
        
        for tx in transactions:
            m_key = tx.timestamp.strftime("%Y-%m")
            if m_key not in month_buckets:
                month_buckets[m_key] = {"credits": Decimal("0.0"), "debits": Decimal("0.0")}
            if tx.direction == "CREDIT":
                month_buckets[m_key]["credits"] += tx.amount
            else:
                month_buckets[m_key]["debits"] += tx.amount
                
        num_months = max(len(month_buckets), 1)
        total_inflow = sum((b["credits"] for b in month_buckets.values()), Decimal("0.0"))
        total_expenses = sum((b["debits"] for b in month_buckets.values()), Decimal("0.0"))
        
        avg_inflow = round_curr(total_inflow / Decimal(str(num_months)))
        avg_expenses = round_curr(total_expenses / Decimal(str(num_months)))
        net_surplus = round_curr(avg_inflow - avg_expenses)
        
        breakdown = [
            {
                "month": m,
                "inflow": b["credits"],
                "expenses": b["debits"],
                "surplus": b["credits"] - b["debits"]
            }
            for m, b in sorted(month_buckets.items())
        ]
        
        return {
            "monthly_operating_inflow": avg_inflow,
            "monthly_operating_expenses": avg_expenses,
            "net_operating_surplus_pre_debt": net_surplus,
            "monthly_breakdown": breakdown,
            "is_empirical": True
        }
    else:
        # Reconstruct from declared profile
        inflow = declared_monthly_turnover
        expenses = round_curr(inflow * operating_expense_ratio)
        surplus = round_curr(inflow - expenses)
        
        return {
            "monthly_operating_inflow": inflow,
            "monthly_operating_expenses": expenses,
            "net_operating_surplus_pre_debt": surplus,
            "monthly_breakdown": [],
            "is_empirical": False
        }
