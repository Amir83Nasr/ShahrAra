import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.api.responses import error_responses
from app.core.config import (
    ADMIN_FIRST_NAME,
    ADMIN_LAST_NAME,
    ADMIN_NATIONAL_ID,
    ADMIN_PHONE,
    AUTO_CREATE_ADMIN,
    OTP_DEV_MODE,
    OTP_EXPIRATION_MINUTES,
    OTP_MAX_ATTEMPTS,
)
from app.core.security import (
    create_access_token,
    hash_secret,
    require_user,
    verify_secret,
)
from app.db.session import get_db
from app.models.models import OtpCode, User
from app.schemas.schemas import (
    CheckPhoneRequest,
    CheckPhoneResponse,
    LoginResponse,
    OtpRequest,
    OtpRequestResponse,
    OtpVerifyRequest,
    PasswordChangeRequest,
    PasswordChangeResponse,
    PasswordLoginRequest,
    ProfileUpdateRequest,
    ProfileUpdateResponse,
    TokenResponse,
    UserResponse,
)

router = APIRouter(tags=["Authentication"])

logger = logging.getLogger(__name__)


# ── Helpers ──────────────────────────────────────────────


def _validate_phone(phone: str) -> None:
    if not (len(phone) == 11 and phone.startswith("09") and phone.isdigit()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شماره موبایل وارد شده نامعتبر است.",
        )


def _ensure_admin(db: Session, phone: str) -> None:
    """Development-only bootstrap for the account named in ADMIN_PHONE.

    Production must create its administrator explicitly (seed or
    ``scripts/create_admin.py``); a public auth request must never mint one.
    """
    if not AUTO_CREATE_ADMIN or not ADMIN_PHONE or not ADMIN_NATIONAL_ID or phone != ADMIN_PHONE:
        return

    existing = db.query(User).filter(User.phone == ADMIN_PHONE).first()
    if existing:
        if not existing.is_admin:
            existing.is_admin = True
            db.commit()
        return

    admin_user = User(
        phone=ADMIN_PHONE,
        national_id=ADMIN_NATIONAL_ID,
        first_name=ADMIN_FIRST_NAME,
        last_name=ADMIN_LAST_NAME,
        is_admin=True,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)


def _issue_login(user: User) -> LoginResponse:
    token = create_access_token(phone=user.phone, is_admin=user.is_admin)
    return LoginResponse(
        success=True,
        token=TokenResponse(accessToken=token, tokenType="bearer"),
        user=UserResponse.model_validate(user),
    )


def _issue_otp(db: Session, phone: str) -> OtpRequestResponse:
    # Single active code per phone: drop previous unconsumed codes.
    db.query(OtpCode).filter(OtpCode.phone == phone, OtpCode.consumed.is_(False)).delete()
    code = f"{secrets.randbelow(10**6):06d}"
    row = OtpCode(
        phone=phone,
        code_hash=hash_secret(code),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRATION_MINUTES),
    )
    db.add(row)
    db.commit()
    _deliver_sms(phone, code)
    return OtpRequestResponse(
        success=True,
        expiresInSeconds=OTP_EXPIRATION_MINUTES * 60,
        devCode=code if OTP_DEV_MODE else None,
    )


def _deliver_sms(phone: str, code: str) -> None:
    # Development delivery only. Never print the code outside OTP_DEV_MODE:
    # server logs are readable by more people than the SMS inbox.
    if OTP_DEV_MODE:
        print(f"[OTP][DEV] phone={phone} code={code}")
        return
    logger.warning(
        "SMS delivery is not configured; OTP for %s was not delivered. "
        "Wire a provider (Kavenegar/SMS.ir) before production.",
        phone,
    )


def _latest_otp(db: Session, phone: str) -> OtpCode | None:
    return (
        db.query(OtpCode)
        .filter(OtpCode.phone == phone, OtpCode.consumed.is_(False))
        .order_by(OtpCode.created_at.desc())
        .first()
    )


# ── Endpoints ────────────────────────────────────────────


@router.post(
    "/check-phone",
    response_model=CheckPhoneResponse,
    summary="Check phone registration state",
    description="Tells the client whether to continue with registration or password sign-in.",
    operation_id="auth_check_phone",
    response_description="Registration state for the phone.",
    responses=error_responses(422),
)
def check_phone(body: CheckPhoneRequest, db: Session = Depends(get_db)):
    _ensure_admin(db, body.phone)
    user = db.query(User).filter(User.phone == body.phone).first()
    return CheckPhoneResponse(
        exists=user is not None,
        hasPassword=user is not None and user.hasPassword,
    )


@router.post(
    "/otp/request",
    response_model=OtpRequestResponse,
    summary="Request a one-time code",
    description="Creates a six-digit code valid for the configured window (2 minutes by default). "
    "In development the code is returned as `devCode` instead of being sent by SMS.",
    operation_id="auth_request_otp",
    response_description="The code was created.",
    responses=error_responses(422),
)
def request_otp(body: OtpRequest, db: Session = Depends(get_db)):
    _ensure_admin(db, body.phone)
    return _issue_otp(db, body.phone)


@router.post(
    "/otp/verify",
    response_model=LoginResponse,
    summary="Verify a one-time code",
    description="Verifies the code and returns an access token. "
    "First-time users must also send `firstName`, `lastName`, and `nationalId`.",
    operation_id="auth_verify_otp",
    response_description="A valid access token and the citizen profile.",
    responses=error_responses(400, 401, 422),
)
def verify_otp(body: OtpVerifyRequest, db: Session = Depends(get_db)):
    row = _latest_otp(db, body.phone)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="کد تأییدی برای این شماره یافت نشد. ابتدا درخواست کد بدهید.",
        )
    if row.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="کد تأیید منقضی شده است. درخواست کد جدید بدهید.",
        )

    if not verify_secret(body.code, row.code_hash):
        # Atomic attempt increment; lock the code once attempts are exhausted.
        updated = (
            db.query(OtpCode)
            .filter(OtpCode.id == row.id, OtpCode.attempts < OTP_MAX_ATTEMPTS)
            .update({"attempts": OtpCode.attempts + 1})
        )
        db.commit()
        if updated == 0:
            row.consumed = True
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="تعداد تلاش‌های نامعتبر بیش از حد مجاز است. درخواست کد جدید بدهید.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="کد تأیید وارد شده صحیح نیست.",
        )

    # Consume atomically — a concurrent second verify loses this race.
    consumed = (
        db.query(OtpCode)
        .filter(OtpCode.id == row.id, OtpCode.consumed.is_(False))
        .update({"consumed": True})
    )
    db.commit()
    if consumed == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="این کد قبلاً استفاده شده است.",
        )

    user = db.query(User).filter(User.phone == body.phone).first()
    if user is None:
        # First-time entry: profile fields are required to register.
        if not body.firstName or not body.lastName or not body.nationalId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="برای تکمیل ثبت‌نام، نام، نام خانوادگی و کد ملی الزامی است.",
            )
        duplicate = db.query(User).filter(User.national_id == body.nationalId).first()
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="این کد ملی قبلاً با شماره تلفن دیگری ثبت شده است.",
            )
        user = User(
            phone=body.phone,
            national_id=body.nationalId,
            first_name=body.firstName.strip(),
            last_name=body.lastName.strip(),
            is_admin=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return _issue_login(user)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the signed-in profile",
    description="Validates the bearer token and returns the current citizen profile. "
    "Use it to confirm a stored session before rendering authenticated screens.",
    operation_id="auth_me",
    response_description="The authenticated user.",
    responses=error_responses(401),
)
def me(user: User = Depends(require_user)):
    return UserResponse.model_validate(user)


# ── Profile ──────────────────────────────────────────────

MAX_AVATAR_BYTES = 2 * 1024 * 1024
ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.put(
    "/profile",
    response_model=ProfileUpdateResponse,
    tags=["Profile"],
    summary="Update the signed-in profile",
    description="Updates the citizen's display name. "
    "The phone number and national ID are immutable.",
    operation_id="profile_update",
    response_description="The updated user profile.",
    responses=error_responses(401, 422),
)
def update_profile(
    body: ProfileUpdateRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    changes = body.model_dump(exclude_unset=True, by_alias=False)
    if not changes:
        return ProfileUpdateResponse(success=True, user=UserResponse.model_validate(user))

    if "firstName" in changes:
        user.first_name = changes["firstName"]
    if "lastName" in changes:
        user.last_name = changes["lastName"]

    db.commit()
    db.refresh(user)
    return ProfileUpdateResponse(success=True, user=UserResponse.model_validate(user))


@router.get(
    "/avatar",
    tags=["Profile"],
    summary="Get the signed-in user's profile picture",
    description="Returns the stored image bytes. The URL is versioned, so it can "
    "be cached until the picture is replaced.",
    operation_id="profile_avatar_get",
    response_description="The profile picture bytes.",
    responses={
        200: {"content": {"image/jpeg": {}, "image/png": {}, "image/webp": {}}},
        401: {"description": "Missing or invalid token."},
        404: {"description": "No profile picture has been uploaded."},
    },
)
def get_avatar(user: User = Depends(require_user)):
    if not user.avatar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="تصویر پروفایل ثبت نشده است.",
        )
    return Response(
        content=user.avatar,
        media_type=user.avatar_mime or "image/jpeg",
        # Private: only the owner sees this image, and the URL changes on replace.
        headers={"Cache-Control": "private, max-age=86400"},
    )


@router.post(
    "/avatar",
    response_model=ProfileUpdateResponse,
    tags=["Profile"],
    summary="Upload a profile picture",
    description="Accepts a JPEG, PNG, or WebP image up to 2 MB and replaces "
    "the current profile picture.",
    operation_id="profile_avatar_upload",
    response_description="The updated user profile.",
    responses=error_responses(401, 422),
)
async def upload_avatar(
    file: UploadFile = File(...),
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="فقط تصویر JPEG، PNG یا WebP قابل بارگذاری است.",
        )

    data = await file.read(MAX_AVATAR_BYTES + 1)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="فایل تصویر خالی است.",
        )
    if len(data) > MAX_AVATAR_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="حجم تصویر باید کمتر از ۲ مگابایت باشد.",
        )

    user.avatar = data
    user.avatar_mime = content_type
    user.avatar_updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return ProfileUpdateResponse(success=True, user=UserResponse.model_validate(user))


@router.delete(
    "/avatar",
    response_model=ProfileUpdateResponse,
    tags=["Profile"],
    summary="Remove the profile picture",
    description="Clears the stored image and restores the initials placeholder.",
    operation_id="profile_avatar_delete",
    response_description="The updated user profile.",
    responses=error_responses(401),
)
def delete_avatar(
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    user.avatar = None
    user.avatar_mime = None
    user.avatar_updated_at = None
    db.commit()
    db.refresh(user)
    return ProfileUpdateResponse(success=True, user=UserResponse.model_validate(user))


@router.post(
    "/login/password",
    summary="Log in with a password",
    description="Authenticates an account that already has a password set.",
    operation_id="auth_login_password",
    response_model=LoginResponse,
    response_description="A valid access token and the citizen profile.",
    responses=error_responses(401, 422),
)
def login_password(body: PasswordLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == body.phone).first()
    # Uniform 401 — no user enumeration.
    if user is None or not user.hasPassword or not verify_secret(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="شماره همراه یا رمز عبور اشتباه است.",
        )
    return _issue_login(user)


@router.put(
    "/password",
    response_model=PasswordChangeResponse,
    summary="Set or change the account password",
    description="Sets a first password, or rotates an existing one. "
    "Rotating requires `currentPassword`.",
    operation_id="auth_change_password",
    response_description="The password was updated.",
    responses=error_responses(401, 422),
)
def change_password(
    body: PasswordChangeRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    if user.hasPassword:
        if not body.currentPassword or not verify_secret(body.currentPassword, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="رمز عبور فعلی صحیح نیست.",
            )
    user.password_hash = hash_secret(body.newPassword)
    db.commit()
    db.refresh(user)
    return PasswordChangeResponse(success=True, user=UserResponse.model_validate(user))
