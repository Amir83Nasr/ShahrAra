from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import ADMIN_NATIONAL_ID, ADMIN_PHONE
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate

router = APIRouter()


def make_user_response(user: User) -> dict:
    return {
        "success": True,
        "user": {
            "id": user.id,
            "phone": user.phone,
            "nationalId": user.national_id,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "isAdmin": user.is_admin,
        },
    }


@router.post("/login")
def login(user_data: UserCreate, db: Session = Depends(get_db)):
    phone = user_data.phone
    national_id = user_data.nationalId
    first_name = user_data.firstName
    last_name = user_data.lastName

    if phone == ADMIN_PHONE and national_id == ADMIN_NATIONAL_ID:
        admin_user = db.query(User).filter(User.phone == ADMIN_PHONE).first()
        if not admin_user:
            admin_user = User(
                phone=ADMIN_PHONE,
                national_id=ADMIN_NATIONAL_ID,
                first_name="مدیر",
                last_name="سامانه",
                is_admin=True,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        return make_user_response(admin_user)

    existing_user = db.query(User).filter(User.phone == phone).first()
    if existing_user:
        if existing_user.national_id != national_id:
            raise HTTPException(
                status_code=401, detail="کد ملی وارد شده با شماره همراه مطابقت ندارد."
            )
        return make_user_response(existing_user)

    if not first_name or not last_name:
        raise HTTPException(
            status_code=400, detail="برای ثبت‌نام جدید، نام و نام خانوادگی الزامی است."
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
    return make_user_response(new_user)
