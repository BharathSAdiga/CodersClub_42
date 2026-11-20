from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import Optional, List, Dict, Any
from datetime import timedelta
import uuid

from ..schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    DemoLoginRequest,
    TokenResponse,
    UserOut,
    UserStatusUpdateRequest,
    UserRoleUpdateRequest,
    AuditLogOut,
    ApplicationCreateRequest,
    ApplicationOut
)
from ..core.config import settings
from ..core.security import (
    validate_password_strength,
    hash_password,
    verify_password,
    create_access_token,
    generate_refresh_token,
    DEMO_PERSONAS,
    utc_now
)
from ..core.auth_deps import (
    get_current_user,
    RequireRoles,
    verify_tenant_access,
    verify_application_access,
    normalize_role
)
from ..db import (
    user_repo,
    refresh_token_repo,
    application_repo,
    audit_repo,
    UserModel
)

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest):
    """
    Registers a new platform user with enterprise password complexity checks,
    unique email/username enforcement, and immediate issuance of access and refresh tokens.
    """
    # 1. Validate password strength
    pwd_err = validate_password_strength(req.password)
    if pwd_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=pwd_err
        )

    # 2. Check for duplicate username
    if user_repo.get_by_username(req.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{req.username}' is already registered."
        )

    # 3. Check for duplicate email
    if user_repo.get_by_email(req.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{req.email}' is already registered."
        )

    # 4. Canonicalize requested role
    role = req.role.upper().strip()
    norm_role = normalize_role(role)
    if norm_role not in ["BORROWER", "LENDER", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{req.role}'. Must be BORROWER, LENDER, or ADMIN."
        )

    # 5. Persist user with salted bcrypt hash
    new_user_id = f"usr_{uuid.uuid4().hex[:12]}"
    pwd_hash = hash_password(req.password)
    user = user_repo.create_user(
        id=new_user_id,
        username=req.username,
        email=req.email,
        full_name=req.full_name,
        password_hash=pwd_hash,
        role=role,
        business_id=req.business_id,
        is_active=True
    )

    # 6. Issue Access Token
    token_data = {
        "sub": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "business_id": user.business_id
    }
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(token_data, expires_delta=expires_delta)

    # 7. Issue and Persist Refresh Token
    raw_refresh = generate_refresh_token()
    refresh_exp = utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token_repo.create(user.id, raw_refresh, refresh_exp)

    user_out = UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        business_id=user.business_id,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login_at=user.last_login_at
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        business_id=user.business_id,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_out
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    """
    Standard secure username/email and password authentication.
    Validates bcrypt hash, active status, updates last_login_at, and issues access & refresh tokens.
    """
    user = user_repo.get_by_username_or_email(credentials.username)
    if not user:
        audit_repo.log_access(
            user_id="anonymous",
            role="UNKNOWN",
            business_id="GLOBAL",
            resource_type="USER",
            action="LOGIN",
            details=f"Failed login attempt for identifier '{credentials.username}' - user not found",
            outcome="DENIED"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Check active status
    if not user.is_active:
        audit_repo.log_access(
            user_id=user.id,
            username=user.username,
            role=user.role,
            business_id=user.business_id or "GLOBAL",
            resource_type="USER",
            action="LOGIN",
            details=f"Deactivated account login attempt by '{user.username}'",
            outcome="DENIED"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated or suspended."
        )

    # Verify bcrypt password hash
    if not verify_password(credentials.password, user.password_hash):
        audit_repo.log_access(
            user_id=user.id,
            username=user.username,
            role=user.role,
            business_id=user.business_id or "GLOBAL",
            resource_type="USER",
            action="LOGIN",
            details=f"Failed password verification for user '{user.username}'",
            outcome="DENIED"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Update last login timestamp
    user_repo.update_last_login(user.id)
    audit_repo.log_access(
        user_id=user.id,
        username=user.username,
        role=user.role,
        business_id=user.business_id or "GLOBAL",
        resource_type="USER",
        action="LOGIN",
        details=f"User '{user.username}' ({user.role}) successfully authenticated.",
        outcome="SUCCESS"
    )

    # Issue Access Token
    token_data = {
        "sub": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "business_id": user.business_id
    }
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(token_data, expires_delta=expires_delta)

    # Issue and Persist Refresh Token
    raw_refresh = generate_refresh_token()
    refresh_exp = utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token_repo.create(user.id, raw_refresh, refresh_exp)

    user_out = UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        business_id=user.business_id,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login_at=utc_now()
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        business_id=user.business_id,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_out
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(req: RefreshTokenRequest):
    """
    Validates a refresh token, performs refresh-token rotation (revoking old, issuing new),
    and returns a refreshed JWT access token. Rejects expired or revoked tokens with 401.
    """
    token_record = refresh_token_repo.get_valid(req.refresh_token)
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, expired, or revoked refresh token."
        )

    user = user_repo.get_by_id(token_record.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or not found."
        )

    # Refresh token rotation: generate new token and mark old as revoked
    new_raw_refresh = generate_refresh_token()
    refresh_token_repo.revoke(req.refresh_token, replaced_by=new_raw_refresh)
    new_exp = utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token_repo.create(user.id, new_raw_refresh, new_exp)

    # Issue new access token
    token_data = {
        "sub": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "business_id": user.business_id
    }
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(token_data, expires_delta=expires_delta)

    user_out = UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        business_id=user.business_id,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login_at=user.last_login_at
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_raw_refresh,
        token_type="bearer",
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        business_id=user.business_id,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_out
    )

@router.post("/logout")
async def logout(
    req: Optional[RefreshTokenRequest] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Logs out the authenticated user and revokes refresh tokens to prevent token reuse.
    """
    if req and req.refresh_token:
        refresh_token_repo.revoke(req.refresh_token)
    refresh_token_repo.revoke_all_for_user(current_user["id"])

    audit_repo.log_access(
        user_id=current_user["id"],
        username=current_user.get("username"),
        role=current_user.get("role", "BORROWER"),
        business_id=current_user.get("business_id", "GLOBAL"),
        resource_type="USER",
        action="LOGOUT",
        details=f"User '{current_user.get('username')}' logged out; session tokens revoked.",
        outcome="SUCCESS"
    )

    return {
        "status": "LOGGED_OUT",
        "message": "User session and refresh tokens successfully revoked."
    }

@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(req: DemoLoginRequest):
    """
    One-click instant authentication for hackathon jury evaluation personas.
    Issues signed JWTs and persistent refresh tokens mapped to preloaded test accounts.
    """
    persona = DEMO_PERSONAS.get(req.persona_key)
    if not persona:
        valid_keys = list(DEMO_PERSONAS.keys())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown persona '{req.persona_key}'. Available personas: {valid_keys}"
        )

    audit_repo.log_access(
        user_id=persona["id"],
        username=persona["username"],
        role=persona["role"],
        business_id=persona["business_id"] or "GLOBAL",
        resource_type="USER",
        action="LOGIN",
        details=f"Demo persona login for '{req.persona_key}' ({persona['role']}).",
        outcome="SUCCESS"
    )

    token_data = {
        "sub": persona["id"],
        "username": persona["username"],
        "email": persona.get("email"),
        "full_name": persona["full_name"],
        "role": persona["role"],
        "business_id": persona["business_id"]
    }
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(token_data, expires_delta=expires_delta)

    raw_refresh = generate_refresh_token()
    refresh_exp = utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token_repo.create(persona["id"], raw_refresh, refresh_exp)

    user_out = UserOut(
        id=persona["id"],
        username=persona["username"],
        email=persona.get("email"),
        full_name=persona["full_name"],
        role=persona["role"],
        business_id=persona["business_id"],
        is_active=True,
        created_at=utc_now()
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        username=persona["username"],
        full_name=persona["full_name"],
        role=persona["role"],
        business_id=persona["business_id"],
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_out
    )

@router.get("/me", response_model=UserOut)
async def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve verified profile and RBAC role for the currently authenticated caller."""
    db_user = user_repo.get_by_id(current_user["id"])
    if db_user:
        return UserOut(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            full_name=db_user.full_name,
            role=db_user.role,
            business_id=db_user.business_id,
            is_active=db_user.is_active,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at,
            last_login_at=db_user.last_login_at
        )

    return UserOut(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user.get("email"),
        full_name=current_user["full_name"],
        role=current_user["role"],
        business_id=current_user.get("business_id"),
        is_active=current_user.get("is_active", True),
        created_at=utc_now()
    )

# =========================================================================
# RBAC & Tenant-Protected Endpoints (Admin, Lender & Borrower Workflows)
# =========================================================================

@router.get("/users", response_model=List[UserOut])
async def list_users_admin(
    role: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(RequireRoles(["ADMIN"]))
):
    """
    Administrative endpoint to inspect platform user directory.
    Strictly protected: requires ADMIN or SUPER_ADMIN role.
    """
    users = user_repo.list_users(role=role, limit=limit, offset=offset)
    return [
        UserOut(
            id=u.id,
            username=u.username,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            business_id=u.business_id,
            is_active=u.is_active,
            created_at=u.created_at,
            updated_at=u.updated_at,
            last_login_at=u.last_login_at
        )
        for u in users
    ]

@router.patch("/users/{user_id}/status", response_model=UserOut)
async def update_user_status_admin(
    user_id: str,
    req: UserStatusUpdateRequest,
    current_user: Dict[str, Any] = Depends(RequireRoles(["ADMIN"]))
):
    """
    Administrative endpoint to activate or suspend a user account.
    """
    updated = user_repo.set_active_status(user_id, req.is_active)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")
    return UserOut(
        id=updated.id,
        username=updated.username,
        email=updated.email,
        full_name=updated.full_name,
        role=updated.role,
        business_id=updated.business_id,
        is_active=updated.is_active,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
        last_login_at=updated.last_login_at
    )

@router.get("/audit-logs", response_model=List[AuditLogOut])
async def view_sensitive_access_logs(
    business_id: Optional[str] = None,
    limit: int = Query(50, le=200),
    current_user: Dict[str, Any] = Depends(RequireRoles(["ADMIN"]))
):
    """
    Administrative and regulatory audit log viewer.
    Records every access to sensitive borrower financial data, credit memos, and documents.
    """
    if business_id:
        logs = audit_repo.get_logs_for_business(business_id, limit=limit)
    else:
        logs = audit_repo.list_system_logs(limit=limit)

    return [
        AuditLogOut(
            id=l.id,
            user_id=l.user_id,
            username=l.username,
            role=l.role,
            business_id=l.business_id,
            resource_type=l.resource_type,
            action=l.action,
            correlation_id=l.correlation_id,
            details=l.details,
            timestamp=l.timestamp
        )
        for l in logs
    ]

@router.post("/applications", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
async def submit_loan_application(
    req: ApplicationCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Submits a new credit application. Borrowers may only submit for their assigned business.
    """
    verify_tenant_access(req.business_id, current_user, resource_type="APPLICATION", action="WRITE")

    app_id = f"APP-{datetime.now().year}-{uuid.uuid4().hex[:6].upper()}"
    app = application_repo.create(
        app_id=app_id,
        business_id=req.business_id,
        applicant_user_id=current_user["id"],
        assigned_lender_id=None,
        requested_amount=req.requested_amount,
        facility_type=req.facility_type
    )

    return ApplicationOut(
        id=app.id,
        business_id=app.business_id,
        applicant_user_id=app.applicant_user_id,
        assigned_lender_id=app.assigned_lender_id,
        facility_type=app.facility_type,
        requested_amount=app.requested_amount,
        status=app.status,
        created_at=app.created_at,
        updated_at=app.updated_at
    )



@router.get("/applications", response_model=List[ApplicationOut])
async def list_loan_applications(
    status: Optional[str] = None,
    limit: int = Query(50, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Lists loan applications accessible to caller.
    - ADMIN: lists all applications.
    - LENDER: lists applications assigned to lender or available for review.
    - BORROWER: lists applications for their enterprise.
    """
    role = normalize_role(current_user.get("role", "BORROWER"))
    if role == "ADMIN":
        apps = application_repo.list_all(limit=limit)
    elif role == "LENDER":
        apps = application_repo.get_for_lender(current_user["id"])
        if not apps:
            apps = application_repo.list_all(limit=limit)
    else:
        biz_id = current_user.get("business_id")
        apps = application_repo.get_for_business(biz_id) if biz_id else []

    return [
        ApplicationOut(
            id=a.id,
            business_id=a.business_id,
            applicant_user_id=a.applicant_user_id,
            assigned_lender_id=a.assigned_lender_id,
            facility_type=a.facility_type,
            requested_amount=a.requested_amount,
            status=a.status,
            created_at=a.created_at,
            updated_at=a.updated_at
        )
        for a in apps
    ]

@router.get("/applications/{application_id}", response_model=ApplicationOut)
async def get_application_detail(
    application_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves loan application details.
    Enforces authorization: Borrower must own the application, Lender must be assigned or hold active borrower consent.
    """
    verify_application_access(application_id, current_user)
    app = application_repo.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    return ApplicationOut(
        id=app.id,
        business_id=app.business_id,
        applicant_user_id=app.applicant_user_id,
        assigned_lender_id=app.assigned_lender_id,
        facility_type=app.facility_type,
        requested_amount=app.requested_amount,
        status=app.status,
        created_at=app.created_at,
        updated_at=app.updated_at
    )


