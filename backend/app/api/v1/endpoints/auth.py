from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_NATIONAL_ID, ADMIN_PHONE
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import LoginResponse, TokenResponse, UserCreate, UserResponse

router = APIRouter(tags=["auth"])


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login or register",
    description="Authenticate with phone and national ID. New users are registered automatically (firstName and lastName required). Admin is auto-created from env defaults.",
    responses={
        400: {"description": "firstName and lastName required for new users"},
        401: {"description": "National ID does not match the phone number"},
    },
)
def login(user_data: UserCreate, db: Session = Depends(get_db)):
    phone = user_data.phone
    national_id = user_data.nationalId
    first_name = user_data.firstName
    last_name = user_data.lastName

    if phone == ADMIN_PHONE and national_id == ADMIN_NATIONAL_ID:
        admin_user = db.query(User).filter(User.phone == ADMIN_PHONE).first()
        if not admin_user:
            admin_user = db.query(User).filter(User.is_admin).first()
        if admin_user:
            admin_user.first_name = ADMIN_FIRST_NAME
            admin_user.last_name = ADMIN_LAST_NAME
        else:
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
        token = create_access_token(phone=admin_user.phone, is_admin=admin_user.is_admin)
        return LoginResponse(
            success=True,
            token=TokenResponse(accessToken=token, tokenType="bearer"),
            user=UserResponse.model_validate(admin_user),
        )

    existing_user = db.query(User).filter(User.phone == phone).first()
    if existing_user:
        if existing_user.national_id != national_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="National ID does not match the phone number.",
            )
        if existing_user.is_admin:
            existing_user.first_name = ADMIN_FIRST_NAME
            existing_user.last_name = ADMIN_LAST_NAME
            db.commit()
            db.refresh(existing_user)
        token = create_access_token(phone=existing_user.phone, is_admin=existing_user.is_admin)
        return LoginResponse(
            success=True,
            token=TokenResponse(accessToken=token, tokenType="bearer"),
            user=UserResponse.model_validate(existing_user),
        )

    if not first_name or not last_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="firstName and lastName are required for new users.",
        )

    new_user = User(
        phone=phone,
        national_id=national_id,
        first_name=first_name,
        last_name=last_name,
        is_admin=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = create_access_token(phone=new_user.phone, is_admin=new_user.is_admin)
    return LoginResponse(
        success=True,
        token=TokenResponse(accessToken=token, tokenType="bearer"),
        user=UserResponse.model_validate(new_user),
    )
