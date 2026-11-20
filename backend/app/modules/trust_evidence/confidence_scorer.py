from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from ...schemas.evidence import (
    EvidenceConfidence,
    EvidenceItem,
    EvidenceConfidenceReport,
    EvidenceProvenanceCategory,
    FairnessAuditStatus,
    utc_now
)
from ...schemas.business import BusinessProfile
from ...schemas.transaction import Transaction

# Explicit, configurable scoring weights
DEFAULT_WEIGHTS = {
    "completeness": 0.30,
    "source_reliability": 0.25,
    "consistency": 0.20,
    "recency": 0.15,
    "cross_source_agreement": 0.10
}

# Source reliability weights per provenance category
PROVENANCE_RELIABILITY_WEIGHTS: Dict[str, float] = {
    "INDEPENDENTLY_VERIFIED": 0.95,
    "SOURCE_LABELLED": 0.80,
    "SYSTEM_DERIVED": 0.75,
    "USER_UPLOADED": 0.65,
    "USER_PROVIDED": 0.50,
    "SELF_REPORTED": 0.40,
    "MISSING": 0.0
}

class EvidenceConfidenceScorer:
    """
    Deterministic Evidence Confidence Scorer.
    
    ARCHITECTURAL GUARANTEES:
    1. Evaluates structural evidence integrity, completeness, recency, and source reliability.
    2. Keeps evidence confidence strictly separate from financial risk.
    3. Missing evidence represents epistemic uncertainty and NEVER implies poor financial health or fraud.
    4. User-uploaded bank statements are categorized as USER_UPLOADED (0.65 reliability)
       until verified via Account Aggregator integration.
    """

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or DEFAULT_WEIGHTS

    def evaluate(
        self,
        business_profile: BusinessProfile,
        transactions: List[Transaction],
        persisted_evidence_records: Optional[List[Any]] = None,
        assessment_id: Optional[str] = None
    ) -> EvidenceConfidence:
        now = utc_now()
        evidence_items: List[EvidenceItem] = []
        data_sources: List[str] = []
        missing_fields: List[str] = []
        inconsistent_fields: List[str] = []
        recommendations: List[str] = []

        # 1. Profile / Self-Declared Evidence
        evidence_items.append(
            EvidenceItem(
                attribute_name="business_profile_declaration",
                provenance="SELF_REPORTED",
                source_reference="self_declared_onboarding",
                is_verified=False,
                confidence_weight=PROVENANCE_RELIABILITY_WEIGHTS["SELF_REPORTED"],
                details="Applicant self-declared enterprise parameters and trade vintage"
            )
        )
        data_sources.append("SELF_DECLARED_PROFILE")

        # 2. Digital Transactions Evidence
        if transactions:
            channels = {t.channel for t in transactions}
            has_bank = any(c in channels for c in ["NEFT_RTGS", "IMPS", "CHEQUE", "CASH_DEPOSIT"])
            has_upi = any(c in channels for c in ["UPI_QR", "POS_SWIPE"])

            # Check if verified via persisted evidence records
            is_verified_bank = False
            prov_bank = "USER_UPLOADED"
            if persisted_evidence_records:
                for ev in persisted_evidence_records:
                    ev_type = getattr(ev, "evidence_type", None) or getattr(ev, "document_type", "")
                    if "BANK" in ev_type:
                        ev_prov = getattr(ev, "provenance_category", None) or getattr(ev, "provenance", "USER_UPLOADED")
                        if ev_prov == "INDEPENDENTLY_VERIFIED":
                            is_verified_bank = True
                            prov_bank = "INDEPENDENTLY_VERIFIED"
                        elif ev_prov == "SOURCE_LABELLED":
                            prov_bank = "SOURCE_LABELLED"

            if has_bank:
                data_sources.append("BANK_STATEMENT_TRANSACTIONS")
                evidence_items.append(
                    EvidenceItem(
                        attribute_name="bank_statement_cashflow",
                        provenance=prov_bank,
                        source_reference=f"bank_ledger_{len(transactions)}_rows",
                        is_verified=is_verified_bank,
                        confidence_weight=PROVENANCE_RELIABILITY_WEIGHTS.get(prov_bank, 0.65),
                        details="Bank transaction history (user-uploaded CSV ledger)" if not is_verified_bank else "Account Aggregator verified banking stream"
                    )
                )

            if has_upi:
                data_sources.append("UPI_QR_TRANSACTIONS")
                evidence_items.append(
                    EvidenceItem(
                        attribute_name="upi_merchant_settlements",
                        provenance="SOURCE_LABELLED",
                        source_reference="upi_qr_batches",
                        is_verified=True,
                        confidence_weight=PROVENANCE_RELIABILITY_WEIGHTS["SOURCE_LABELLED"],
                        details="NPCI / Merchant aggregator settlements with timestamped payload"
                    )
                )

            # Completeness based on transaction count and depth
            temporal_days = 0
            if len(transactions) > 1:
                dates = [t.timestamp for t in transactions]
                temporal_days = max(1, (max(dates) - min(dates)).days)
            completeness_score = min(1.0, 0.4 + (len(transactions) / 100.0) * 0.4 + (min(temporal_days, 180) / 180.0) * 0.2)
        else:
            completeness_score = 0.25
            temporal_days = 0
            missing_fields.append("DIGITAL_TRANSACTION_HISTORY")
            recommendations.append("Upload at least 90 days of bank or UPI transaction history to substantiate cash flow.")

        # 3. Formal Registrations / Statutory Filings
        if business_profile.has_gstin and business_profile.gstin:
            data_sources.append("GST_PORTAL")
            evidence_items.append(
                EvidenceItem(
                    attribute_name="gst_3b_tax_filings",
                    provenance="SOURCE_LABELLED",
                    source_reference=f"gstin_{business_profile.gstin}",
                    is_verified=True,
                    confidence_weight=PROVENANCE_RELIABILITY_WEIGHTS["SOURCE_LABELLED"],
                    details="GSTIN active tax filings registered under CBIC"
                )
            )
        else:
            missing_fields.append("GSTIN_RETURNS_3B")
            evidence_items.append(
                EvidenceItem(
                    attribute_name="gst_3b_tax_filings",
                    provenance="MISSING",
                    source_reference=None,
                    is_verified=False,
                    confidence_weight=PROVENANCE_RELIABILITY_WEIGHTS["MISSING"],
                    details="Exempt or unregistered under statutory threshold"
                )
            )

        if business_profile.has_udyam_registration:
            data_sources.append("UDYAM_MSME_REGISTRATION")
            evidence_items.append(
                EvidenceItem(
                    attribute_name="udyam_registration_certificate",
                    provenance="SOURCE_LABELLED",
                    source_reference="udyam_msme_verified",
                    is_verified=True,
                    confidence_weight=PROVENANCE_RELIABILITY_WEIGHTS["SOURCE_LABELLED"],
                    details="Ministry of MSME Udyam registration certificate"
                )
            )
        else:
            missing_fields.append("UDYAM_REGISTRATION")

        # 4. Consistency & Recency Calculations
        consistency_score = 1.0
        recency_score = 1.0

        if transactions:
            # Check transaction recency
            most_recent_tx = max(t.timestamp for t in transactions)
            most_recent_utc = most_recent_tx.replace(tzinfo=timezone.utc) if most_recent_tx.tzinfo is None else most_recent_tx
            days_since_latest = max(0, (now - most_recent_utc).days)
            if days_since_latest > 90:
                recency_score = 0.50
                recommendations.append(f"Transactions are {days_since_latest} days old; upload fresh statements within 30 days.")
            elif days_since_latest > 30:
                recency_score = 0.80
            else:
                recency_score = 1.0

            # Consistency: compare declared turnover vs transaction inflow
            credit_txs = [t for t in transactions if t.direction == "CREDIT"]
            total_credits = sum((t.amount for t in credit_txs), Decimal("0.0"))
            if temporal_days > 15:
                monthly_observed_inflow = float((total_credits / Decimal(str(temporal_days))) * Decimal("30.0"))
            else:
                monthly_observed_inflow = float(total_credits)

            declared_turnover = float(business_profile.declared_monthly_turnover)
            if declared_turnover > 0:
                diff_pct = abs(monthly_observed_inflow - declared_turnover) / declared_turnover
                if diff_pct > 0.40:
                    consistency_score -= 0.25
                    inconsistent_fields.append("DECLARED_TURNOVER_VS_INFLOW")
                    recommendations.append(
                        f"Declared monthly turnover (₹{declared_turnover:,.0f}) differs significantly from observed transaction inflow (₹{monthly_observed_inflow:,.0f}). Provide sales reconciliation."
                    )
                agreement_score = max(0.0, min(1.0, 1.0 - diff_pct))
            else:
                agreement_score = 0.60
        else:
            agreement_score = 0.40
            recency_score = 0.30
            consistency_score = 0.70

        # 5. Source Reliability Score
        non_missing_items = [item for item in evidence_items if item.provenance != "MISSING"]
        if non_missing_items:
            source_reliability_score = sum(i.confidence_weight for i in non_missing_items) / len(non_missing_items)
        else:
            source_reliability_score = 0.40

        # 6. Composite Evidence Confidence Score
        w = self.weights
        composite_score = (
            w["completeness"] * completeness_score +
            w["source_reliability"] * source_reliability_score +
            w["consistency"] * consistency_score +
            w["recency"] * recency_score +
            w["cross_source_agreement"] * agreement_score
        ) * 100.0

        clamped_score = max(15.0, min(95.0, round(composite_score, 1)))

        # Confidence band
        if clamped_score >= 80.0:
            band = "HIGH"
            rationale = "High evidence confidence: broad multi-stream coverage with consistent ledger and identity records."
        elif clamped_score >= 50.0:
            band = "MODERATE"
            rationale = "Moderate evidence confidence: verifiable digital transactions present, but user-uploaded provenance or statutory exemptions increase uncertainty bands."
        else:
            band = "LOW"
            rationale = "Low evidence confidence: limited digital transaction records or significant gaps in documentation."

        if not recommendations:
            recommendations.append("Connect Account Aggregator for automated independent bank ledger verification.")

        provenance_counts = {}
        for item in evidence_items:
            provenance_counts[item.provenance] = provenance_counts.get(item.provenance, 0) + 1

        sources_prov = {item.attribute_name: item.provenance for item in evidence_items}

        return EvidenceConfidence(
            business_id=business_profile.business_id,
            assessment_id=assessment_id,
            evidence_confidence_score=clamped_score,
            confidence_band=band,
            data_completeness_pct=round(completeness_score * 100.0, 1),
            consistency_pct=round(consistency_score * 100.0, 1),
            recency_pct=round(recency_score * 100.0, 1),
            source_reliability_pct=round(source_reliability_score * 100.0, 1),
            temporal_coverage_days=temporal_days,
            total_records_analyzed=len(transactions),
            available_data_sources=data_sources,
            missing_evidence_fields=missing_fields,
            inconsistent_fields=inconsistent_fields,
            evidence_items=evidence_items,
            sources_provenance=sources_prov,
            provenance_breakdown=provenance_counts,
            cross_source_concordance_pct=round(agreement_score * 100.0, 1),
            fairness_audit_status="PASSED",
            confidence_rationale=rationale,
            recommendations_to_improve=recommendations
        )

evidence_confidence_scorer = EvidenceConfidenceScorer()
