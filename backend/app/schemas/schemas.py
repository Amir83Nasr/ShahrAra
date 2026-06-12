from enum import Enum as PyEnum
from typing import Optional

from pydantic import BaseModel, Field


class RequestType(str, PyEnum):
    problem = "problem"
    idea = "idea"


class RequestStatus(str, PyEnum):
    submitted = "submitted"
    under_review = "under_review"
    in_progress = "in_progress"
    resolved = "resolved"
    archived = "archived"


class Coordinates(BaseModel):
    lat: float
    lng: float


class UserCreate(BaseModel):
    phone: str
    nationalId: str = Field(alias="nationalId")
    firstName: Optional[str] = Field(None, alias="firstName")
    lastName: Optional[str] = Field(None, alias="lastName")

    model_config = {"populate_by_name": True}


class UserResponse(BaseModel):
    id: str
    phone: str
    nationalId: str = Field(alias="nationalId")
    firstName: str = Field(alias="firstName")
    lastName: str = Field(alias="lastName")
    isAdmin: bool = Field(alias="isAdmin")

    model_config = {"from_attributes": True, "populate_by_name": True}


class RequestCreate(BaseModel):
    title: str
    description: str
    type: RequestType
    category: str
    coordinates: Coordinates
    region: str = ""
    userPhone: str = Field(alias="userPhone")
    userName: str = Field(alias="userName")

    model_config = {"populate_by_name": True}


class RequestResponse(BaseModel):
    id: str
    title: str
    description: str
    type: RequestType
    category: str
    coordinates: Coordinates
    region: str
    status: RequestStatus
    userPhone: str = Field(alias="userPhone")
    userName: str = Field(alias="userName")
    createdAt: str = Field(alias="createdAt")
    adminResponse: Optional[str] = Field(None, alias="adminResponse")
    likes: int

    model_config = {"from_attributes": True, "populate_by_name": True}


class StatsResponse(BaseModel):
    totalCount: int
    problemsCount: int
    ideasCount: int
    byStatus: dict
    byCategory: dict
