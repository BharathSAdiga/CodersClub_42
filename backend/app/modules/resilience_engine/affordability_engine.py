from typing import List, Optional
from decimal import Decimal, ROUND_HALF_UP
from ...schemas.resilience import AffordabilityAnalysis, DebtObligation, RepaymentStructureComparison
from .debt_reconciliation import match_debt_obligations
from .repayment_structures import (
    calculate_standard_amortization_emi,
    calculate_max_affordable_principal_from_emi,
    compare_repayment_structures,
    round_curr
)

def calculate_affordability(
    monthly_operating_inflow: Decimal,
    monthly_operating_expenses: Decimal,
    declared_obligations: Optional[List[DebtObligation]] = None,
    verified_obligations: Optional[List[DebtObligation]] = None,
    proposed_loan_amount_inr: Decimal = Decimal("0.0"),
    proposed_tenure_months: int = 12,
    indicative_annual_interest_rate_pct: float = 14.0,
    foir_cap_pct: Decimal = Decimal("50.0"),
    seasonality_index: float = 1.0
) -> AffordabilityAnalysis:
    """
    Computes deterministic borrowing capacity, debt service affordability,
    and repayment structure comparisons.
    
    Guarantees:
    - Zero division safety on DSCR when obligations are zero.
    - Negative operating surplus yields 0 affordable borrowing.
    - Single-counted debt obligations via obligation-level matching.
    - 100% deterministic Decimal calculations using standard amortization.
    """
    declared_obligations = declared_obligations or []
    verified_obligations = verified_obligations or []
    
    # 1. Operating surplus before debt
    net_surplus_pre_debt = round_curr(monthly_operating_inflow - monthly_operating_expenses)
    
    # 2. Obligation-level matching
    matched, unmatched_decl, unmatched_verif, reconciled_debt = match_debt_obligations(
        declared_obligations=declared_obligations,
        verified_obligations=verified_obligations
    )
    
    total_declared_emi = sum((o.monthly_payment for o in declared_obligations), Decimal("0.0"))
    total_verified_debits = sum((o.monthly_payment for o in verified_obligations), Decimal("0.0"))
    
    # 3. Unencumbered cash surplus
    unencumbered_surplus = round_curr(net_surplus_pre_debt - reconciled_debt)
    
    # 4. Maximum affordable EMI & Loan Principal using exact Amortization Formula (FOIR cap)
    foir_ratio = foir_cap_pct / Decimal("100.0")
    if unencumbered_surplus > Decimal("0.0"):
        max_affordable_emi = round_curr(unencumbered_surplus * foir_ratio)
        max_affordable_principal = calculate_max_affordable_principal_from_emi(
            max_safe_emi=max_affordable_emi,
            tenure_months=proposed_tenure_months if proposed_tenure_months > 0 else 12,
            annual_interest_rate_pct=indicative_annual_interest_rate_pct
        )
    else:
        max_affordable_emi = Decimal("0.0")
        max_affordable_principal = Decimal("0.0")

    # 5. Proposed loan EMI calculation (bounded by safe principal if evaluated)
    safe_proposed_loan = min(proposed_loan_amount_inr, max_affordable_principal) if max_affordable_principal > Decimal("0.0") else proposed_loan_amount_inr
    if proposed_loan_amount_inr > Decimal("0.0") and proposed_tenure_months > 0:
        proposed_emi = calculate_standard_amortization_emi(
            principal=proposed_loan_amount_inr,
            tenure_months=proposed_tenure_months,
            annual_interest_rate_pct=indicative_annual_interest_rate_pct
        )
    else:
        proposed_emi = Decimal("0.0")
        
    # 6. Total post-borrowing debt service
    total_post_borrowing_debt_service = round_curr(reconciled_debt + proposed_emi)
    is_debt_free = (total_post_borrowing_debt_service == Decimal("0.0"))
    
    # 7. DSCR calculation (Safe handling for zero debt service)
    if not is_debt_free and total_post_borrowing_debt_service > Decimal("0.0"):
        dscr_val = float(net_surplus_pre_debt / total_post_borrowing_debt_service)
        projected_dscr = round(dscr_val, 2)
    else:
        projected_dscr = None

    # 8. Repayment structures comparison
    target_principal_for_comparison = proposed_loan_amount_inr if proposed_loan_amount_inr > Decimal("0.0") else max_affordable_principal
    repayment_comparisons = compare_repayment_structures(
        loan_principal=target_principal_for_comparison,
        tenure_months=proposed_tenure_months if proposed_tenure_months > 0 else 12,
        annual_interest_rate_pct=indicative_annual_interest_rate_pct,
        baseline_monthly_inflow=monthly_operating_inflow,
        max_safe_principal=max_affordable_principal,
        seasonality_index=seasonality_index
    )
        
    return AffordabilityAnalysis(
        monthly_operating_inflow=monthly_operating_inflow,
        monthly_operating_expenses=monthly_operating_expenses,
        net_operating_surplus_pre_debt=net_surplus_pre_debt,
        declared_obligations=declared_obligations,
        verified_obligations=verified_obligations,
        matched_obligations=matched,
        unmatched_declared_obligations=unmatched_decl,
        unmatched_verified_obligations=unmatched_verif,
        declared_existing_monthly_emi=round_curr(total_declared_emi),
        verified_existing_monthly_debt_debits=round_curr(total_verified_debits),
        reconciled_existing_debt_service=round_curr(reconciled_debt),
        unencumbered_monthly_cash_surplus=unencumbered_surplus,
        proposed_loan_amount_inr=round_curr(proposed_loan_amount_inr),
        proposed_tenure_months=proposed_tenure_months,
        indicative_annual_interest_rate_pct=indicative_annual_interest_rate_pct,
        proposed_monthly_emi=proposed_emi,
        total_post_borrowing_monthly_debt_service=total_post_borrowing_debt_service,
        is_debt_free=is_debt_free,
        projected_dscr=projected_dscr,
        maximum_affordable_monthly_emi=max_affordable_emi,
        maximum_affordable_loan_principal=max_affordable_principal,
        repayment_comparisons=repayment_comparisons
    )
