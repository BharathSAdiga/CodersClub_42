import pytest
from decimal import Decimal
from datetime import datetime, timezone
from pydantic import ValidationError

from backend.app.schemas.business import BusinessProfile, BusinessProfileCreate
from backend.app.schemas.transaction import Transaction, TransactionBatchIngest
from backend.app.schemas.financial_dna import FinancialDNA
from backend.app.schemas.evidence import EvidenceConfidence, EvidenceItem
from backend.app.schemas.resilience import (
    AffordabilityAnalysis,
    DebtObligation,
    ShockScenarioInput,
    ShockSimulationResult
)
from backend.app.schemas.assessment import CreditAppraisalMemo

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

# 1. Test: Invalid negative monetary inputs
def test_invalid_negative_monetary_inputs():
    with pytest.raises(ValidationError):
        BusinessProfileCreate(
            legal_name="Negative Turnover MSME",
            trade_name="Bad Co",
            sector="RETAIL_KIRANA",
            vintage_months=12,
            location_tier="TIER_2",
            entity_type="PROPRIETORSHIP",
            declared_monthly_turnover=Decimal("-5000.00"),  # Negative should fail
            declared_existing_monthly_emi=Decimal("100.00")
        )

    with pytest.raises(ValidationError):
        BusinessProfileCreate(
            legal_name="Negative EMI MSME",
            trade_name="Bad EMI Co",
            sector="RETAIL_KIRANA",
            vintage_months=12,
            location_tier="TIER_2",
            entity_type="PROPRIETORSHIP",
            declared_monthly_turnover=Decimal("5000.00"),
            declared_existing_monthly_emi=Decimal("-100.00")  # Negative EMI should fail
        )

    with pytest.raises(ValidationError):
        Transaction(
            transaction_id="tx_neg",
            business_id="msme_001",
            timestamp=utc_now(),
            amount=Decimal("-50.00"),  # Negative transaction amount should fail
            direction="CREDIT",
            channel="UPI_QR",
            category="CUSTOMER_REVENUE"
        )

# 2. Test: Missing balance and cash velocity data
def test_missing_balance_and_cash_velocity():
    dna = FinancialDNA(
        business_id="msme_no_bal_001",
        total_credit_volume=Decimal("150000.00"),
        total_debit_volume=Decimal("110000.00"),
        net_operating_cashflow=Decimal("40000.00"),
        monthly_average_turnover=Decimal("75000.00"),
        daily_average_inflow=Decimal("2500.00"),
        daily_average_balance_proxy=None,  # Optional when unavailable
        cash_velocity_days=None,           # Optional when unavailable
        inflow_volatility_cv=0.22,
        seasonality_index=1.15
    )
    assert dna.daily_average_balance_proxy is None
    assert dna.cash_velocity_days is None
    assert dna.seasonality_index == 1.15

# 3. Test: Zero debt service and negative operating surplus
def test_zero_debt_service_and_negative_operating_surplus():
    inflow = Decimal("50000.00")
    expenses = Decimal("65000.00")  # Operating loss
    surplus_pre_debt = inflow - expenses  # -15000.00
    
    affordability = AffordabilityAnalysis(
        monthly_operating_inflow=inflow,
        monthly_operating_expenses=expenses,
        net_operating_surplus_pre_debt=surplus_pre_debt,
        declared_existing_monthly_emi=Decimal("0.0"),
        verified_existing_monthly_debt_debits=Decimal("0.0"),
        reconciled_existing_debt_service=Decimal("0.0"),
        unencumbered_monthly_cash_surplus=surplus_pre_debt,
        proposed_loan_amount_inr=Decimal("0.0"),
        proposed_monthly_emi=Decimal("0.0"),
        total_post_borrowing_monthly_debt_service=Decimal("0.0"),
        is_debt_free=True,
        projected_dscr=None,  # Safe handling: zero debt service prevents ZeroDivisionError
        maximum_affordable_monthly_emi=Decimal("0.0"),
        maximum_affordable_loan_principal=Decimal("0.0")
    )
    assert affordability.unencumbered_monthly_cash_surplus == Decimal("-15000.00")
    assert affordability.is_debt_free is True
    assert affordability.projected_dscr is None
    assert affordability.maximum_affordable_monthly_emi == Decimal("0.0")

# 4. Test: Two declared loans with only one verified
def test_two_declared_loans_one_verified():
    loan_1 = DebtObligation(
        obligation_id="decl_loan_1",
        lender_name="Bank of Baroda Mudra Loan",
        monthly_payment=Decimal("4000.00"),
        source="DECLARED",
        is_matched=True,
        matched_reference_id="verif_debit_1"
    )
    loan_2 = DebtObligation(
        obligation_id="decl_loan_2",
        lender_name="Informal Chits/NBFC",
        monthly_payment=Decimal("2500.00"),
        source="DECLARED",
        is_matched=False,
        matched_reference_id=None
    )
    verif_debit_1 = DebtObligation(
        obligation_id="verif_debit_1",
        lender_name="BOB Auto-Debit",
        monthly_payment=Decimal("4000.00"),
        source="VERIFIED_BANK_DEBIT",
        is_matched=True,
        matched_reference_id="decl_loan_1"
    )
    
    declared_obligations = [loan_1, loan_2]
    verified_obligations = [verif_debit_1]
    matched_obligations = [loan_1]
    unmatched_declared = [loan_2]
    unmatched_verified = []
    
    # Matched counted once (4000) + unmatched declared (2500) = 6500 total
    reconciled_debt = (
        sum(o.monthly_payment for o in matched_obligations) +
        sum(o.monthly_payment for o in unmatched_declared) +
        sum(o.monthly_payment for o in unmatched_verified)
    )
    assert reconciled_debt == Decimal("6500.00")
    
    affordability = AffordabilityAnalysis(
        monthly_operating_inflow=Decimal("100000.00"),
        monthly_operating_expenses=Decimal("70000.00"),
        net_operating_surplus_pre_debt=Decimal("30000.00"),
        declared_obligations=declared_obligations,
        verified_obligations=verified_obligations,
        matched_obligations=matched_obligations,
        unmatched_declared_obligations=unmatched_declared,
        unmatched_verified_obligations=unmatched_verified,
        declared_existing_monthly_emi=Decimal("6500.00"),
        verified_existing_monthly_debt_debits=Decimal("4000.00"),
        reconciled_existing_debt_service=reconciled_debt,
        unencumbered_monthly_cash_surplus=Decimal("30000.00") - reconciled_debt,
        total_post_borrowing_monthly_debt_service=reconciled_debt
    )
    assert affordability.reconciled_existing_debt_service == Decimal("6500.00")
    assert affordability.unencumbered_monthly_cash_surplus == Decimal("23500.00")

# 5. Test: A declared loan and verified debit referring to the same obligation
def test_declared_loan_and_verified_debit_same_obligation():
    decl = DebtObligation(
        obligation_id="decl_101",
        lender_name="HDFC Micro Loan",
        monthly_payment=Decimal("5000.00"),
        source="DECLARED",
        is_matched=True,
        matched_reference_id="verif_202"
    )
    verif = DebtObligation(
        obligation_id="verif_202",
        lender_name="HDFC ACH Debit",
        monthly_payment=Decimal("5000.00"),
        source="VERIFIED_BANK_DEBIT",
        is_matched=True,
        matched_reference_id="decl_101"
    )
    
    # Must NOT double count 5000 + 5000 to 10000
    matched = [decl]
    reconciled_debt = sum(o.monthly_payment for o in matched)
    assert reconciled_debt == Decimal("5000.00")

# 6. Test: Missing GST evidence
def test_missing_gst_evidence_neutral_treatment():
    evidence = EvidenceConfidence(
        business_id="msme_informal_001",
        evidence_confidence_score=68.0,
        data_completeness_pct=65.0,
        available_data_sources=["BANK_STATEMENTS", "UPI_QR_LOGS"],
        missing_evidence_fields=["GSTIN_REGISTRATION", "GSTR_3B_FILINGS"],
        evidence_items=[
            EvidenceItem(
                attribute_name="monthly_turnover",
                provenance="INDEPENDENTLY_VERIFIED",
                source_reference="bank_ac_7891",
                is_verified=True
            ),
            EvidenceItem(
                attribute_name="gst_records",
                provenance="MISSING",
                source_reference=None,
                is_verified=False
            )
        ],
        sources_provenance={
            "BANK_STATEMENTS": "INDEPENDENTLY_VERIFIED",
            "GST_RECORDS": "MISSING"
        }
    )
    assert "MISSING" in evidence.sources_provenance["GST_RECORDS"]
    assert "NEUTRAL_UNCERTAINTY" in evidence.missing_data_treatment_policy
    assert evidence.fairness_audit_status == "NOT_RUN"

# 7. Test: Fairness audit not yet run
def test_fairness_audit_not_yet_run():
    evidence = EvidenceConfidence(
        business_id="msme_new_001",
        evidence_confidence_score=75.0,
        data_completeness_pct=80.0
    )
    assert evidence.fairness_audit_status == "NOT_RUN"
    assert evidence.fairness_audit_passed is None

# 8. Test: Insufficient evidence resulting in UNASSESSED
def test_insufficient_evidence_unassessed():
    memo = CreditAppraisalMemo(
        assessment_id="eval_insufficient_001",
        business_id="msme_sparse_001",
        assessment_status="INSUFFICIENT_EVIDENCE",
        financial_risk_band="UNASSESSED",  # UNASSESSED rather than a fabricated risk band
        evidence_confidence_score=24.0,
        investigation_status="NORMAL_PATTERNS",
        recommended_loan_amount_inr=Decimal("0.0"),
        recommended_tenure_months=0,
        indicative_apr_min_pct=None,
        indicative_apr_max_pct=None,
        indicative_apr_range="N/A",
        recommended_facility_type="NONE_RECOMMENDED",
        assumptions=["Insufficient transaction volume to establish cashflow baseline"],
        data_limitations=["Under 30 days of transactional history available"],
        evidence_references=["sparse_batch_001"],
        calculation_version="1.0.0",
        cam_narrative_markdown="Assessment deferred due to insufficient record history."
    )
    assert memo.assessment_status == "INSUFFICIENT_EVIDENCE"
    assert memo.financial_risk_band == "UNASSESSED"
    assert memo.recommended_loan_amount_inr == Decimal("0.0")

# 9. Test: Transaction batch duplicate IDs
def test_transaction_batch_duplicate_ids():
    t1 = Transaction(
        transaction_id="tx_dup_1",
        business_id="msme_dup_test",
        timestamp=utc_now(),
        amount=Decimal("1200.00"),
        direction="CREDIT",
        channel="UPI_QR",
        category="CUSTOMER_REVENUE"
    )
    t2 = Transaction(
        transaction_id="tx_dup_1",  # Same ID
        business_id="msme_dup_test",
        timestamp=utc_now(),
        amount=Decimal("800.00"),
        direction="DEBIT",
        channel="UPI_QR",
        category="SUPPLIER_PURCHASE"
    )
    with pytest.raises(ValidationError) as excinfo:
        TransactionBatchIngest(
            business_id="msme_dup_test",
            transactions=[t1, t2]
        )
    assert "Duplicate transaction IDs detected" in str(excinfo.value)

# 10. Test: Decimal monetary calculations
def test_decimal_monetary_calculations():
    # 0.1 + 0.2 in floating point produces 0.30000000000000004
    # With Decimal, it must be exactly Decimal('0.30')
    d1 = Decimal("0.10")
    d2 = Decimal("0.20")
    total = d1 + d2
    assert total == Decimal("0.30")
    
    t1 = Transaction(
        transaction_id="tx_dec_1",
        business_id="msme_dec",
        timestamp=utc_now(),
        amount=Decimal("1450.75"),
        direction="CREDIT",
        channel="UPI_QR",
        category="CUSTOMER_REVENUE"
    )
    t2 = Transaction(
        transaction_id="tx_dec_2",
        business_id="msme_dec",
        timestamp=utc_now(),
        amount=Decimal("549.25"),
        direction="CREDIT",
        channel="UPI_QR",
        category="CUSTOMER_REVENUE"
    )
    batch_credit_sum = t1.amount + t2.amount
    assert batch_credit_sum == Decimal("2000.00")
    assert isinstance(batch_credit_sum, Decimal)
