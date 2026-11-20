from typing import List, Tuple
from decimal import Decimal, ROUND_HALF_UP
from ...schemas.resilience import RepaymentStructureComparison

def round_curr(val: Decimal) -> Decimal:
    """Helper to quantize currency to two decimal places."""
    return val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def calculate_standard_amortization_emi(
    principal: Decimal,
    tenure_months: int,
    annual_interest_rate_pct: float
) -> Decimal:
    """
    Standard monthly EMI using amortization formula:
    EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    """
    if principal <= Decimal("0.0") or tenure_months <= 0:
        return Decimal("0.0")
        
    annual_rate_dec = Decimal(str(annual_interest_rate_pct)) / Decimal("100.0")
    monthly_rate = annual_rate_dec / Decimal("12.0")
    
    if monthly_rate > Decimal("0.0"):
        factor = (Decimal("1.0") + monthly_rate) ** tenure_months
        emi = principal * monthly_rate * factor / (factor - Decimal("1.0"))
        return round_curr(emi)
    else:
        return round_curr(principal / Decimal(str(tenure_months)))

def calculate_max_affordable_principal_from_emi(
    max_safe_emi: Decimal,
    tenure_months: int,
    annual_interest_rate_pct: float
) -> Decimal:
    """
    Inverts the amortization formula to find the exact maximum affordable principal:
    P_max = EMI_max * ((1+r)^n - 1) / (r * (1+r)^n)
    """
    if max_safe_emi <= Decimal("0.0") or tenure_months <= 0:
        return Decimal("0.0")
        
    annual_rate_dec = Decimal(str(annual_interest_rate_pct)) / Decimal("100.0")
    monthly_rate = annual_rate_dec / Decimal("12.0")
    
    if monthly_rate > Decimal("0.0"):
        factor = (Decimal("1.0") + monthly_rate) ** tenure_months
        principal = max_safe_emi * (factor - Decimal("1.0")) / (monthly_rate * factor)
        # Quantize to thousands conservatively
        return round_curr(principal).quantize(Decimal("1000"), rounding=ROUND_HALF_UP)
    else:
        return round_curr(max_safe_emi * Decimal(str(tenure_months))).quantize(Decimal("1000"), rounding=ROUND_HALF_UP)

def compare_repayment_structures(
    loan_principal: Decimal,
    tenure_months: int,
    annual_interest_rate_pct: float,
    baseline_monthly_inflow: Decimal,
    max_safe_principal: Decimal,
    seasonality_index: float = 1.0
) -> List[RepaymentStructureComparison]:
    """
    Evaluates and compares 3 repayment structures:
    1. Standard Monthly EMI
    2. Revenue-Linked Repayment
    3. Seasonality-Adjusted Repayment
    
    Guarantees:
    - Same underlying principal and total interest under baseline assumptions.
    - Accurately measures peak payment pressure (% of monthly revenue).
    - Checks whether proposed loan exceeds safe affordability limit.
    """
    if loan_principal <= Decimal("0.0") or tenure_months <= 0:
        return []

    is_within_limit = (loan_principal <= max_safe_principal)
    standard_emi = calculate_standard_amortization_emi(
        principal=loan_principal,
        tenure_months=tenure_months,
        annual_interest_rate_pct=annual_interest_rate_pct
    )
    total_repayment = round_curr(standard_emi * Decimal(str(tenure_months)))
    total_interest = round_curr(total_repayment - loan_principal)
    
    # Inflow check for pressure
    inflow_base = max(baseline_monthly_inflow, Decimal("1.0"))
    
    # 1. Standard Monthly EMI
    std_pressure = float((standard_emi / inflow_base) * Decimal("100.0"))
    struct_standard = RepaymentStructureComparison(
        structure_type="STANDARD_MONTHLY_EMI",
        description="Fixed monthly installment amortized over tenure.",
        loan_principal=loan_principal,
        tenure_months=tenure_months,
        indicative_annual_interest_rate_pct=annual_interest_rate_pct,
        total_repayment_amount=total_repayment,
        total_interest_amount=total_interest,
        average_monthly_payment=standard_emi,
        peak_monthly_payment=standard_emi,
        trough_monthly_payment=standard_emi,
        repayment_pressure_peak_pct=round(std_pressure, 2),
        is_within_safe_limit=is_within_limit
    )
    
    # 2. Revenue-Linked Repayment (e.g. daily/weekly revenue sweep)
    # Target sweep percentage tied to monthly average
    sweep_pct = (standard_emi / inflow_base)
    # Peak payment during a +20% high-turnover month
    peak_rev_payment = round_curr(standard_emi * Decimal("1.20"))
    trough_rev_payment = round_curr(standard_emi * Decimal("0.80"))
    rev_pressure = float(sweep_pct * Decimal("100.0"))  # Pressure remains fixed % of revenue!
    struct_revenue = RepaymentStructureComparison(
        structure_type="REVENUE_LINKED",
        description="Flexible daily/monthly sweep (% of digital revenue). Automatically reduces in lean months.",
        loan_principal=loan_principal,
        tenure_months=tenure_months,
        indicative_annual_interest_rate_pct=annual_interest_rate_pct,
        total_repayment_amount=total_repayment,
        total_interest_amount=total_interest,
        average_monthly_payment=standard_emi,
        peak_monthly_payment=peak_rev_payment,
        trough_monthly_payment=trough_rev_payment,
        repayment_pressure_peak_pct=round(rev_pressure, 2),
        is_within_safe_limit=is_within_limit
    )
    
    # 3. Seasonality-Adjusted Repayment
    # If seasonality is high (e.g. 1.5), peak months step up by 30%, trough months step down by 30%
    seas_delta = min(max(Decimal(str(seasonality_index - 1.0)) * Decimal("0.5"), Decimal("0.10")), Decimal("0.40"))
    peak_seas_payment = round_curr(standard_emi * (Decimal("1.0") + seas_delta))
    trough_seas_payment = round_curr(standard_emi * (Decimal("1.0") - seas_delta))
    seas_pressure = float((peak_seas_payment / (inflow_base * (Decimal("1.0") + seas_delta))) * Decimal("100.0"))
    struct_seasonal = RepaymentStructureComparison(
        structure_type="SEASONALITY_ADJUSTED",
        description="Structured step-up during peak trading months and step-down during monsoon/lean months.",
        loan_principal=loan_principal,
        tenure_months=tenure_months,
        indicative_annual_interest_rate_pct=annual_interest_rate_pct,
        total_repayment_amount=total_repayment,
        total_interest_amount=total_interest,
        average_monthly_payment=standard_emi,
        peak_monthly_payment=peak_seas_payment,
        trough_monthly_payment=trough_seas_payment,
        repayment_pressure_peak_pct=round(seas_pressure, 2),
        is_within_safe_limit=is_within_limit
    )
    
    return [struct_standard, struct_revenue, struct_seasonal]
