import uuid
from enum import Enum as PyEnum

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
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

    id = Column(String, primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex[:8]}")
    phone = Column(String, unique=True, index=True, nullable=False)
    national_id = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)

    @property
    def nationalId(self):
        return self.national_id

    @property
    def firstName(self):
        return self.first_name

    @property
    def lastName(self):
        return self.last_name

    @property
    def isAdmin(self):
        return self.is_admin


class Request(Base):
    __tablename__ = "requests"

    id = Column(String, primary_key=True, default=lambda: f"req_{uuid.uuid4().hex[:8]}")
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    lat = Column(String, nullable=False)
    lng = Column(String, nullable=False)
    region = Column(String, nullable=False)
    status = Column(String, default="submitted")
    user_phone = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    admin_response = Column(Text, nullable=True)
    likes = Column(Integer, default=0)

    @property
    def coordinates(self):
        return {"lat": float(self.lat), "lng": float(self.lng)}

    @property
    def userPhone(self):
        return self.user_phone

    @property
    def userName(self):
        return self.user_name

    @property
    def createdAt(self):
        return self.created_at.isoformat() if self.created_at else ""

    @property
    def adminResponse(self):
        return self.admin_response
