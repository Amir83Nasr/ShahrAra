import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import (
    ADMIN_FIRST_NAME,
    ADMIN_LAST_NAME,
    ADMIN_NATIONAL_ID,
    ADMIN_PHONE,
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
    TokenResponse,
    UserResponse,
)

router = APIRouter(tags=["auth"])


# ── Helpers ──────────────────────────────────────────────


def _validate_phone(phone: str) -> None:
    if not (len(phone) == 11 and phone.startswith("09") and phone.isdigit()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شماره موبایل وارد شده نامعتبر است.",
        )


def _ensure_admin(db: Session, phone: str) -> None:
    """Auto-create the admin account from env defaults on first contact."""
    if phone != ADMIN_PHONE:
        return
    existing = db.query(User).filter(User.phone == ADMIN_PHONE).first()
    if existing:
        return
    admin_user = db.query(User).filter(User.is_admin).first()
    if not admin_user:
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
    # ponytail: dev-mode only delivery — replace with a real SMS provider
    # (Kavenegar/SMS.ir) when OTP_DEV_MODE=false ships.
    print(f"[OTP] phone={phone} code={code}")


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
    description="Generates a 6-digit code valid for OTP_EXPIRATION_MINUTES. In dev mode the code is returned in the response (devCode).",
)
def request_otp(body: OtpRequest, db: Session = Depends(get_db)):
    _ensure_admin(db, body.phone)
    return _issue_otp(db, body.phone)


@router.post(
    "/otp/verify",
    response_model=LoginResponse,
    responses={
        400: {"description": "کد نامعتبر/منقضی/مصرف‌شده یا اطلاعات ثبت‌نام ناقص"},
        401: {"description": "کد تأیید وارد شده صحیح نیست"},
    },
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


@router.post(
    "/login/password",
    response_model=LoginResponse,
    responses={401: {"description": "شماره همراه یا رمز عبور اشتباه است"}},
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
    responses={401: {"description": "رمز عبور فعلی صحیح نیست"}},
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
