from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from app.db.session import Base


class RequestType(str, PyEnum):
    problem = "problem"
    idea = "idea"


class RequestStatus(str, PyEnum):
    submitted = "submitted"
    under_review = "under_review"
    in_progress = "in_progress"
    resolved = "resolved"
    archived = "archived"


class User(Base):
    __tablename__ = "users"

    id: str = Column(String, primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex}")
    phone: str = Column(String, unique=True, index=True, nullable=False)
    national_id: str = Column(String, nullable=False)
    first_name: str = Column(String, nullable=False)
    last_name: str = Column(String, nullable=False)
    is_admin: bool = Column(Boolean, default=False)
    password_hash: str | None = Column(String, nullable=True)
    # Profile picture kept in the row: the app has no object storage, and an
    # avatar is small enough (the client downscales before uploading).
    avatar: bytes | None = Column(LargeBinary, nullable=True)
    avatar_mime: str | None = Column(String, nullable=True)
    avatar_updated_at: datetime | None = Column(DateTime(timezone=True), nullable=True)

    @property
    def nationalId(self) -> str:
        return self.national_id

    @property
    def firstName(self) -> str:
        return self.first_name

    @property
    def lastName(self) -> str:
        return self.last_name

    @property
    def isAdmin(self) -> bool:
        return self.is_admin

    @property
    def hasPassword(self) -> bool:
        return self.password_hash is not None

    @property
    def avatarUrl(self) -> str | None:
        """Versioned, authenticated URL for the user's profile picture."""
        if not self.avatar:
            return None
        version = int(self.avatar_updated_at.timestamp()) if self.avatar_updated_at else 0
        return f"/api/v1/auth/avatar?v={version}"

    def __repr__(self) -> str:
        return f"<User {self.id} phone={self.phone}>"


class OtpCode(Base):
    __tablename__ = "otp_codes"

    id: str = Column(String, primary_key=True, default=lambda: f"otp_{uuid.uuid4().hex}")
    phone: str = Column(String, nullable=False, index=True)
    code_hash: str = Column(String, nullable=False)
    expires_at: datetime = Column(DateTime(timezone=True), nullable=False)
    attempts: int = Column(Integer, default=0)
    consumed: bool = Column(Boolean, default=False)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<OtpCode {self.id} phone={self.phone}>"


class Request(Base):
    __tablename__ = "requests"

    id: str = Column(String, primary_key=True, default=lambda: f"req_{uuid.uuid4().hex}")
    title: str = Column(String, nullable=False)
    description: str = Column(Text, nullable=False)
    type: str = Column(String, nullable=False)
    category: str = Column(String, nullable=False)
    lat: str = Column(String, nullable=False)
    lng: str = Column(String, nullable=False)
    region: str = Column(String, nullable=False)
    status: str = Column(String, default="submitted")
    user_phone: str = Column(String, nullable=False)
    user_name: str = Column(String, nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())
    admin_response: str | None = Column(Text, nullable=True)
    likes: int = Column(Integer, default=0)

    @property
    def coordinates(self) -> dict[str, float]:
        return {"lat": float(self.lat), "lng": float(self.lng)}

    @property
    def userPhone(self) -> str:
        return self.user_phone

    @property
    def userName(self) -> str:
        return self.user_name

    @property
    def createdAt(self) -> str:
        return self.created_at.isoformat() if self.created_at else ""

    @property
    def adminResponse(self) -> str | None:
        return self.admin_response

    def __repr__(self) -> str:
        return f"<Request {self.id} type={self.type} status={self.status}>"


class Like(Base):
    __tablename__ = "likes"

    id: str = Column(String, primary_key=True, default=lambda: f"lik_{uuid.uuid4().hex}")
    user_phone: str = Column(String, nullable=False, index=True)
    request_id: str = Column(
        String,
        ForeignKey("requests.id", ondelete="CASCADE", name="fk_likes_request_id"),
        nullable=False,
    )

    __table_args__ = (UniqueConstraint("user_phone", "request_id", name="uq_user_request_like"),)

    def __repr__(self) -> str:
        return f"<Like {self.id} user={self.user_phone} request={self.request_id}>"


class Notification(Base):
    __tablename__ = "notifications"

    id: str = Column(String, primary_key=True, default=lambda: f"ntf_{uuid.uuid4().hex}")
    user_phone: str = Column(String, nullable=False, index=True)
    message: str = Column(String, nullable=False)
    request_id: str | None = Column(
        String,
        ForeignKey("requests.id", ondelete="SET NULL", name="fk_notifications_request_id"),
        nullable=True,
    )
    request_title: str = Column(String, nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())
    is_read: bool = Column(Boolean, default=False)

    def __repr__(self) -> str:
        return f"<Notification {self.id} user={self.user_phone} read={self.is_read}>"
