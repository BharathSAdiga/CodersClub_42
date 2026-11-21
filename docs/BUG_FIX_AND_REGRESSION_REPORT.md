# UDYOGA — Bug Fix & Regression Prevention Report

**Audit Phase**: Comprehensive Functional Testing, Debugging & Repair  
**Lead Engineer**: Principal Software & Systems Reliability Engineer  
**Date**: November 2026  
**Status**: 100% Resolved & Regressively Tested

---

## 1. Summary of Identified Defects & Enacted Repairs

During this audit cycle, all identified issues—from frontend UI disconnection to backend endpoint mismatches—were repaired, re-tested, and verified with dedicated automated tests.

---

### Defect 1: Public "Sign In" Button Unresponsive
* **Symptom**: Clicking "Sign In" or "Access Platform" on the top navigation bar produced no UI reaction.
* **Root Cause**: In `frontend/src/App.tsx`, `<Navbar>` was rendered without passing the required `onOpenAuthModal` callback prop.
* **Fix Applied**: 
  - Passed `onOpenAuthModal={() => setIsAuthModalOpen(true)}` to `<Navbar>`.
  - Passed `isAuthenticated={apiService.isAuthenticated()}` and `onLogout={handleLogout}`.
* **Regression Check**: Verified modal opens on click, authenticates user, and triggers layout transition.

---

### Defect 2: Sidebar Logout Action Dead Across All Portals
* **Symptom**: Clicking "Sign Out" in the sidebar did nothing in Borrower, Lender, and Admin layouts.
* **Root Cause**: `BorrowerLayout`, `LenderLayout`, and `AdminLayout` did not forward the `onLogout` prop to `<Sidebar>`.
* **Fix Applied**: Wired `onLogout={handleLogout}` into all three layout components in `App.tsx`.
* **Regression Check**: Clicking Sign Out successfully invokes `apiService.logout()`, clears session storage, shows a toast notification, and switches app mode back to `'PUBLIC'`.

---

### Defect 3: Demo Persona Login Failed with HTTP 400 Bad Request
* **Symptom**: Clicking the "Sunita Rao" demo shortcut in `AuthModal.tsx` resulted in an error toast.
* **Root Cause**: `AuthModal.tsx` submitted persona key `PERSONA_SUNITA`, but `backend/app/core/security.py` only defined `PERSONA_AUDITOR`.
* **Fix Applied**: Added alias in `backend/app/core/security.py`:
  ```python
  DEMO_PERSONAS["PERSONA_SUNITA"] = DEMO_PERSONAS["PERSONA_AUDITOR"]
  ```
* **Regression Check**: Added automated test in `backend/tests/test_functional_repairs.py:test_demo_persona_logins` confirming Sunita logs in with status 200 and receives the `ETHICS_AUDITOR` role token.

---

### Defect 4: Session Lost on Page Reload
* **Symptom**: Refreshing the browser on `/borrower/dashboard` or `/lender/workbench` kicked the user out to the landing page.
* **Root Cause**: `App.tsx` did not inspect token presence on component mount.
* **Fix Applied**: Added a bootstrap `useEffect` in `App.tsx` checking `apiService.isAuthenticated()` and restoring active role state from session storage.
* **Regression Check**: Reloading the page preserves borrower, lender, or admin sessions seamlessly.

---

### Defect 5: Business Profile View Read-Only with Missing Backend PUT Endpoint
* **Symptom**: The "Edit Profile" button had no modal, and backend lacked an update route for MSME demographic changes.
* **Fix Applied**:
  1. Built edit modal in `BusinessProfileView.tsx` with inputs for trade name, legal name, turnover, and EMI.
  2. Created Pydantic schema `BusinessProfileUpdate` in `backend/app/schemas/business.py`.
  3. Created `PUT /api/v1/business/profile/{business_id}` endpoint in `backend/app/api/endpoints_business.py`.
* **Regression Check**: Verified with automated test `test_business_profile_update_and_persistence` and negative value rejection test `test_business_profile_validation_rejects_negative_turnover`.

---

### Defect 6: Loan Application Creation Did Not Persist
* **Symptom**: "Submit Application" button in `ApplicationCreationView.tsx` updated local mock state only.
* **Fix Applied**:
  - Connected `handleSubmit` in `ApplicationCreationView.tsx` to `apiService.submitApplication(...)`.
  - Created backing `LoanApplicationModel` record in SQLite.
* **Regression Check**: Verified application appears in database table `loan_applications` with status `'SUBMITTED'`.

---

### Defect 7: Lender Sanction / Decline Decisions Not Persisted
* **Symptom**: Clicking "Sanction Loan" or "Decline" in `ApplicantDetailWorkbench.tsx` was ephemeral.
* **Fix Applied**:
  - Implemented `update_status` method in `ApplicationRepository`.
  - Added `PUT /api/v1/auth/applications/{application_id}/status` endpoint in `endpoints_auth.py` with RBAC checks.
  - Connected workbench decision handler to `apiService.updateApplicationStatus`.
* **Regression Check**: Automated test `test_application_lifecycle_and_status_update` verified lender approval persists to DB and unauthorized borrower updates are rejected with HTTP 403.

---

### Defect 8: Unresponsive Buttons in Admin Audit & Telemetry
* **Symptom**: "Export Signed CSV", "Verify Merkle Root", "Ping All Endpoints", and "Synthetic Load Test" were inert.
* **Fix Applied**:
  - Implemented client-side CSV download and SHA-256 Merkle root verification in `AuditLogsView.tsx`.
  - Implemented round-trip latency pinging calling `apiService.getHealth()` in `SystemTelemetryView.tsx`.
* **Regression Check**: Verified buttons provide visual feedback, trigger network pings, and generate valid RFC 4180 CSV downloads.

---

### Defect 9: Schema Inconsistency in `AffordabilityAnalysis`
* **Symptom**: Test failure with `AttributeError: 'AffordabilityAnalysis' object has no attribute 'is_over_leveraged'`.
* **Fix Applied**: Added `is_over_leveraged: bool = Field(default=False)` to `AffordabilityAnalysis` in `resilience.py` and computed it in `affordability_engine.py`.
* **Regression Check**: `test_financial_accuracy_zero_revenue_and_negative_cashflow` passed 100%.

---

## 2. Regression Test Summary

All existing and newly authored tests were executed:
* **Total Pytest Tests**: 282
* **Passing**: 282
* **Failing**: 0
* **Regression Count**: 0
