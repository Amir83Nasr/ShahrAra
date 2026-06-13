from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import JWT_ALGORITHM, JWT_EXPIRATION_MINUTES, JWT_SECRET
from app.db.session import get_db
from app.models.models import User

security_scheme = HTTPBearer(auto_error=False)


def create_access_token(phone: str, is_admin: bool) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    payload = {"sub": phone, "is_admin": is_admin, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        phone: str | None = payload.get("sub")
        if phone is None:
            return None
    except JWTError:
        return None
    return db.query(User).filter(User.phone == phone).first()


def require_admin(
    current_user: User | None = Depends(get_current_user),
) -> User:
    if current_user is None or not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user
