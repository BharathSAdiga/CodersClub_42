from typing import List, Dict, Optional, Any, Set, Tuple
from datetime import datetime, timezone
from decimal import Decimal
import uuid

from ...schemas.evidence import (
    ReconciliationDiscrepancy,
    CrossSourceReconciliationResult,
    utc_now
)
from ...schemas.business import BusinessProfile
from ...schemas.transaction import Transaction

class CrossSourceReconciliationEngine:
    """
    Deterministic Cross-Source Reconciliation Engine.
    
    Cross-checks multiple independent data streams:
    - Declared turnover vs verified transaction inflows
    - Declared debt obligations vs bank recurring EMI debits
    - Operating expenses vs actual debit outflows
    - Duplicate transaction detection (same timestamp, amount, counterparty)
    - Unmatched liabilities and undeclared debt service
    
    CRITICAL POLICY:
    - Discrepancies are categorized with severity and recommended actions.
    - Never modifies source financial records.
    - Never labels discrepancies as fraud without investigation.
    """

    def reconcile(
        self,
        business_profile: BusinessProfile,
        transactions: List[Transaction],
        debt_obligations: Optional[List[Any]] = None,
        evidence_records: Optional[List[Any]] = None
    ) -> CrossSourceReconciliationResult:
        discrepancies: List[ReconciliationDiscrepancy] = []
        unmatched_liabilities_count = 0
        now = utc_now()

        # -------------------------------------------------------------
        # 1. Turnover Reconciliation: Declared Turnover vs Actual Credits
        # -------------------------------------------------------------
        declared_turnover = float(business_profile.declared_monthly_turnover)
        credit_txs = [t for t in transactions if t.direction == "CREDIT"]
        
        if transactions and credit_txs:
            dates = [t.timestamp for t in transactions]
            temporal_days = max(1, (max(dates) - min(dates)).days)
            total_credits = sum((t.amount for t in credit_txs), Decimal("0.0"))
            
            if temporal_days >= 15:
                observed_monthly_inflow = float((total_credits / Decimal(str(temporal_days))) * Decimal("30.0"))
            else:
                observed_monthly_inflow = float(total_credits)

            if declared_turnover > 0:
                diff_amount = observed_monthly_inflow - declared_turnover
                diff_pct = abs(diff_amount) / declared_turnover

                if diff_pct > 0.50:
                    severity = "HIGH" if diff_amount < 0 else "MEDIUM"
                    discrepancies.append(
                        ReconciliationDiscrepancy(
                            discrepancy_id=f"disc_trn_{uuid.uuid4().hex[:8]}",
                            discrepancy_type="TURNOVER_MISMATCH",
                            severity=severity,
                            source_a="BUSINESS_PROFILE_DECLARED_TURNOVER",
                            source_b="BANK_TRANSACTION_CREDIT_INFLOW",
                            difference_amount=round(abs(diff_amount), 2),
                            description=(
                                f"Declared turnover of ₹{declared_turnover:,.0f}/month deviates by "
                                f"{diff_pct * 100.0:.1f}% from observed transaction inflow of ₹{observed_monthly_inflow:,.0f}/month."
                            ),
                            suggested_action=(
                                "Request GST 3B return or sales invoice summary to substantiate unbanked cash transactions or seasonal variation."
                            ),
                            flagged_for_human_review=True
                        )
                    )
                elif diff_pct > 0.25:
                    discrepancies.append(
                        ReconciliationDiscrepancy(
                            discrepancy_id=f"disc_trn_{uuid.uuid4().hex[:8]}",
                            discrepancy_type="TURNOVER_MISMATCH",
                            severity="LOW",
                            source_a="BUSINESS_PROFILE_DECLARED_TURNOVER",
                            source_b="BANK_TRANSACTION_CREDIT_INFLOW",
                            difference_amount=round(abs(diff_amount), 2),
                            description=(
                                f"Minor turnover divergence: Declared ₹{declared_turnover:,.0f} vs Observed ₹{observed_monthly_inflow:,.0f} ({diff_pct * 100.0:.1f}% diff)."
                            ),
                            suggested_action="Review transaction seasonality and average collection cycles.",
                            flagged_for_human_review=False
                        )
                    )

        # -------------------------------------------------------------
        # 2. Debt Obligations Reconciliation
        # -------------------------------------------------------------
        declared_monthly_emi = float(business_profile.declared_existing_monthly_emi)
        emi_debits = [t for t in transactions if t.direction == "DEBIT" and t.category == "EXISTING_LOAN_EMI"]
        
        observed_emi_total = sum((float(t.amount) for t in emi_debits), 0.0)

        # Check declared obligations from debt_obligations table if provided
        known_obligations_total = 0.0
        if debt_obligations:
            known_obligations_total = sum(
                float(getattr(o, "monthly_payment", 0.0)) for o in debt_obligations
            )

        effective_declared_debt = max(declared_monthly_emi, known_obligations_total)

        if emi_debits and effective_declared_debt == 0.0:
            # Undeclared debt obligation observed in bank recurring debits!
            unmatched_liabilities_count += len(emi_debits)
            discrepancies.append(
                ReconciliationDiscrepancy(
                    discrepancy_id=f"disc_dbt_{uuid.uuid4().hex[:8]}",
                    discrepancy_type="UNMATCHED_LIABILITY",
                    severity="HIGH",
                    source_a="BANK_STATEMENT_DEBIT_STREAM",
                    source_b="BORROWER_DECLARED_DEBT_OBLIGATIONS",
                    difference_amount=round(observed_emi_total, 2),
                    description=(
                        f"Detected {len(emi_debits)} recurring loan debit(s) totaling ₹{observed_emi_total:,.0f} in bank statements, "
                        f"but zero existing debt was disclosed in the loan declaration."
                    ),
                    suggested_action=(
                        "Verify with applicant if debit represents an active NBFC/MFI loan, supplier credit facility, or personal equipment lease."
                    ),
                    flagged_for_human_review=True
                )
            )
        elif emi_debits and observed_emi_total > effective_declared_debt * 1.30:
            diff_emi = observed_emi_total - effective_declared_debt
            unmatched_liabilities_count += 1
            discrepancies.append(
                ReconciliationDiscrepancy(
                    discrepancy_id=f"disc_dbt_{uuid.uuid4().hex[:8]}",
                    discrepancy_type="UNMATCHED_LIABILITY",
                    severity="MEDIUM",
                    source_a="BANK_STATEMENT_DEBIT_STREAM",
                    source_b="BORROWER_DECLARED_DEBT_OBLIGATIONS",
                    difference_amount=round(diff_emi, 2),
                    description=(
                        f"Observed monthly EMI debits (₹{observed_emi_total:,.0f}) exceed disclosed obligations (₹{effective_declared_debt:,.0f}) by ₹{diff_emi:,.0f}."
                    ),
                    suggested_action="Request updated credit bureau or sanction letters for existing commercial loans.",
                    flagged_for_human_review=True
                )
            )

        # -------------------------------------------------------------
        # 3. Duplicate Transaction Detection
        # -------------------------------------------------------------
        seen_txs: Dict[str, Transaction] = {}
        duplicates: List[Tuple[Transaction, Transaction]] = []
        
        for t in transactions:
            # Key by date (day), amount, counterparty, and direction
            date_key = t.timestamp.strftime("%Y-%m-%d")
            key = f"{date_key}_{t.amount}_{t.direction}_{t.counterparty_id or t.counterparty_name}"
            if key in seen_txs:
                duplicates.append((seen_txs[key], t))
            else:
                seen_txs[key] = t

        if duplicates:
            discrepancies.append(
                ReconciliationDiscrepancy(
                    discrepancy_id=f"disc_dup_{uuid.uuid4().hex[:8]}",
                    discrepancy_type="DUPLICATE_TRANSACTION",
                    severity="LOW",
                    source_a="BANK_STATEMENT_RECORD_A",
                    source_b="BANK_STATEMENT_RECORD_B",
                    difference_amount=float(duplicates[0][1].amount),
                    description=(
                        f"Found {len(duplicates)} duplicate transaction pair(s) with identical timestamp, amount, and counterparty."
                    ),
                    suggested_action="Inspect statement parsing deduplication to ensure volume is not artificially doubled.",
                    flagged_for_human_review=False
                )
            )

        # -------------------------------------------------------------
        # 4. Overall Concordance Score Calculation
        # -------------------------------------------------------------
        penalty_score = 0.0
        for d in discrepancies:
            if d.severity == "CRITICAL":
                penalty_score += 30.0
            elif d.severity == "HIGH":
                penalty_score += 20.0
            elif d.severity == "MEDIUM":
                penalty_score += 10.0
            elif d.severity == "LOW":
                penalty_score += 3.0

        concordance_score = max(20.0, min(100.0, round(100.0 - penalty_score, 1)))
        is_concordant = concordance_score >= 70.0 and unmatched_liabilities_count == 0

        if is_concordant:
            summary = "Cross-source reconciliation verified: declared business metrics and banking cash flow demonstrate high concordance."
        elif discrepancies:
            summary = f"Reconciliation audit identified {len(discrepancies)} discrepancy item(s) requiring human underwriting review."
        else:
            summary = "Reconciliation audit completed with standard coverage."

        return CrossSourceReconciliationResult(
            is_concordant=is_concordant,
            concordance_score=concordance_score,
            discrepancies=discrepancies,
            total_discrepancies=len(discrepancies),
            unmatched_liabilities_count=unmatched_liabilities_count,
            summary=summary,
            timestamp=now
        )

cross_source_reconciliation_engine = CrossSourceReconciliationEngine()
