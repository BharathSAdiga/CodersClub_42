from typing import List, Tuple, Optional
from decimal import Decimal, ROUND_HALF_UP
from ...schemas.resilience import DebtObligation

def match_debt_obligations(
    declared_obligations: List[DebtObligation],
    verified_obligations: List[DebtObligation],
    amount_tolerance_pct: Decimal = Decimal("5.0")
) -> Tuple[List[DebtObligation], List[DebtObligation], List[DebtObligation], Decimal]:
    """
    Performs deterministic obligation-level matching between declared loans and verified bank debits.
    
    Guarantees:
    1. Matched obligations are counted exactly ONCE to prevent double-counting.
    2. Unmatched declared obligations are preserved (conservative underwriting).
    3. Unmatched verified bank debits are included (capturing hidden debt).
    4. Exact Decimal arithmetic throughout.
    
    Returns:
        (matched_obligations, unmatched_declared, unmatched_verified, reconciled_total_monthly_debt)
    """
    matched: List[DebtObligation] = []
    unmatched_declared: List[DebtObligation] = []
    unmatched_verified: List[DebtObligation] = list(verified_obligations)
    
    for decl in declared_obligations:
        decl_amount = decl.monthly_payment
        found_match_idx: Optional[int] = None
        
        for idx, verif in enumerate(unmatched_verified):
            verif_amount = verif.monthly_payment
            
            # Check for direct reference match or amount within tolerance
            is_ref_match = (
                decl.matched_reference_id and decl.matched_reference_id == verif.obligation_id
            ) or (
                verif.matched_reference_id and verif.matched_reference_id == decl.obligation_id
            )
            
            if decl_amount > Decimal("0.0"):
                diff_pct = abs(decl_amount - verif_amount) / decl_amount * Decimal("100.0")
            else:
                diff_pct = Decimal("0.0") if verif_amount == Decimal("0.0") else Decimal("100.0")
                
            is_amount_close = diff_pct <= amount_tolerance_pct
            
            # Lender name match bonus
            is_name_match = False
            if decl.lender_name and verif.lender_name:
                d_name = decl.lender_name.lower()
                v_name = verif.lender_name.lower()
                if d_name in v_name or v_name in d_name:
                    is_name_match = True
            
            # Match criteria:
            # 1. Direct explicit reference match
            # 2. Exact amount match (diff_pct == 0.0)
            # 3. Close amount within tolerance with fuzzy name match or single candidate
            if is_ref_match or diff_pct == Decimal("0.0") or (is_amount_close and (is_name_match or len(unmatched_verified) == 1)):
                found_match_idx = idx
                break
                
        if found_match_idx is not None:
            matched_verif = unmatched_verified.pop(found_match_idx)
            # Create matched record using higher of declared or verified for prudence
            matched_payment = max(decl.monthly_payment, matched_verif.monthly_payment)
            matched_record = DebtObligation(
                obligation_id=f"matched_{decl.obligation_id}_{matched_verif.obligation_id}",
                lender_name=decl.lender_name or matched_verif.lender_name,
                monthly_payment=matched_payment,
                source="MATCHED",
                matched_reference_id=matched_verif.obligation_id,
                is_matched=True,
                confidence_score=0.95
            )
            matched.append(matched_record)
        else:
            unmatched_decl = DebtObligation(
                obligation_id=decl.obligation_id,
                lender_name=decl.lender_name,
                monthly_payment=decl.monthly_payment,
                source="UNMATCHED",
                is_matched=False,
                confidence_score=0.70
            )
            unmatched_declared.append(unmatched_decl)
            
    # Mark remaining verified debits as unmatched
    unmatched_verif_final = []
    for verif in unmatched_verified:
        unmatched_v = DebtObligation(
            obligation_id=verif.obligation_id,
            lender_name=verif.lender_name,
            monthly_payment=verif.monthly_payment,
            source="UNMATCHED",
            is_matched=False,
            confidence_score=0.90
        )
        unmatched_verif_final.append(unmatched_v)
        
    reconciled_total = (
        sum((o.monthly_payment for o in matched), Decimal("0.0")) +
        sum((o.monthly_payment for o in unmatched_declared), Decimal("0.0")) +
        sum((o.monthly_payment for o in unmatched_verif_final), Decimal("0.0"))
    )
    
    return matched, unmatched_declared, unmatched_verif_final, reconciled_total
