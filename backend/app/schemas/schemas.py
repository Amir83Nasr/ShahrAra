from __future__ import annotations

from enum import Enum as PyEnum

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
    lat: float = Field(ge=-90, le=90, examples=[35.7219])
    lng: float = Field(ge=-180, le=180, examples=[51.3347])

    model_config = {"json_schema_extra": {"example": {"lat": 35.7219, "lng": 51.3347}}}


class UserCreate(BaseModel):
    phone: str = Field(examples=["09123456789"])
    nationalId: str = Field(alias="nationalId", examples=["1234567890"])
    firstName: str | None = Field(None, alias="firstName", examples=["Ali"])
    lastName: str | None = Field(None, alias="lastName", examples=["Rezaei"])

    model_config = {"populate_by_name": True}


class UserResponse(BaseModel):
    id: str = Field(examples=["usr_a1b2c3d4"])
    phone: str = Field(examples=["09000000000"])
    nationalId: str = Field(alias="nationalId", examples=["037000000"])
    firstName: str = Field(alias="firstName", examples=["Ali"])
    lastName: str = Field(alias="lastName", examples=["Rezaei"])
    isAdmin: bool = Field(alias="isAdmin")

    model_config = {"from_attributes": True, "populate_by_name": True}


class TokenResponse(BaseModel):
    accessToken: str = Field(alias="accessToken", examples=["eyJhbGciOiJIUzI1NiIs..."])
    tokenType: str = Field(alias="tokenType", default="bearer")

    model_config = {"populate_by_name": True}


class LoginResponse(BaseModel):
    success: bool
    token: TokenResponse
    user: UserResponse

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "token": {
                    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
                    "tokenType": "bearer",
                },
                "user": {
                    "id": "usr_a1b2c3d4",
                    "phone": "09123456789",
                    "nationalId": "1234567890",
                    "firstName": "Ali",
                    "lastName": "Rezaei",
                    "isAdmin": False,
                },
            }
        }
    }


class RequestCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200, examples=["Pothole on Valiasr Street"])
    description: str = Field(
        min_length=1,
        examples=[
            "The asphalt on Valiasr Street near Vanak Square has been damaged for months and needs urgent repair."
        ],
    )
    type: RequestType
    category: str = Field(examples=["Asphalt & Roads"])
    coordinates: Coordinates
    region: str = Field(default="", examples=["District 3"])
    userPhone: str = Field(alias="userPhone", examples=["09123456789"])
    userName: str = Field(alias="userName", examples=["Ali Rezaei"])

    model_config = {"populate_by_name": True}


class RequestResponse(BaseModel):
    id: str = Field(examples=["req_x1y2z3w4"])
    title: str = Field(examples=["Pothole on Valiasr Street"])
    description: str = Field(examples=["The asphalt on Valiasr Street needs repair."])
    type: RequestType
    category: str = Field(examples=["Asphalt & Roads"])
    coordinates: Coordinates
    region: str = Field(examples=["District 3"])
    status: RequestStatus
    userPhone: str = Field(alias="userPhone", examples=["09123456789"])
    userName: str = Field(alias="userName", examples=["Ali Rezaei"])
    createdAt: str = Field(alias="createdAt", examples=["2025-06-13T10:30:00"])
    adminResponse: str | None = Field(None, alias="adminResponse", examples=["Under review"])
    likes: int = Field(ge=0, examples=[5])
    likedByCurrentUser: bool | None = Field(None, alias="likedByCurrentUser")

    model_config = {"from_attributes": True, "populate_by_name": True}

    @classmethod
    def from_orm(cls, req, liked_by_current_user: bool | None = None) -> RequestResponse:
        return cls(
            id=req.id,
            title=req.title,
            description=req.description,
            type=RequestType(req.type),
            category=req.category,
            coordinates=Coordinates(lat=float(req.lat), lng=float(req.lng)),
            region=req.region,
            status=RequestStatus(req.status),
            userPhone=req.user_phone,
            userName=req.user_name,
            createdAt=req.created_at.isoformat() if req.created_at else "",
            adminResponse=req.admin_response,
            likes=req.likes,
            likedByCurrentUser=liked_by_current_user,
        )


class CreateRequestResponse(BaseModel):
    success: bool
    request: RequestResponse

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "request": {
                    "id": "req_x1y2z3w4",
                    "title": "Pothole on Valiasr Street",
                    "description": "The asphalt on Valiasr Street needs repair.",
                    "type": "problem",
                    "category": "Asphalt & Roads",
                    "coordinates": {"lat": 35.7219, "lng": 51.3347},
                    "region": "District 3",
                    "status": "submitted",
                    "userPhone": "09123456789",
                    "userName": "Ali Rezaei",
                    "createdAt": "2025-06-13T10:30:00",
                    "adminResponse": None,
                    "likes": 0,
                },
            }
        }
    }


class StatusUpdate(BaseModel):
    status: RequestStatus
    adminResponse: str | None = Field(
        None, alias="adminResponse", examples=["Completed successfully"]
    )

    model_config = {"populate_by_name": True}


class StatusUpdateResponse(BaseModel):
    success: bool
    request: RequestResponse


class LikeRequest(BaseModel):
    userPhone: str = Field(alias="userPhone", examples=["09123456789"])

    model_config = {"populate_by_name": True}


class LikeResponse(BaseModel):
    success: bool
    request: RequestResponse


class StatsResponse(BaseModel):
    totalCount: int = Field(ge=0, examples=[42])
    problemsCount: int = Field(ge=0, examples=[30])
    ideasCount: int = Field(ge=0, examples=[12])
    byStatus: dict[str, int] = Field(
        examples=[
            {"submitted": 10, "under_review": 8, "in_progress": 15, "resolved": 7, "archived": 2}
        ]
    )
    byCategory: dict[str, int] = Field(
        examples=[{"Asphalt & Roads": 15, "Beautification": 10, "Lighting": 5}]
    )


class ErrorResponse(BaseModel):
    detail: str = Field(examples=["Request not found."])


# ── Notification ───────────────────────────────────────


class NotificationResponse(BaseModel):
    id: str = Field(examples=["ntf_a1b2c3d4"])
    userPhone: str = Field(alias="userPhone", examples=["09123456789"])
    message: str = Field(examples=["Your request status changed."])
    requestId: str | None = Field(None, alias="requestId", examples=["req_x1y2z3w4"])
    requestTitle: str | None = Field(None, alias="requestTitle", examples=["Pothole repair"])
    createdAt: str = Field(alias="createdAt", examples=["2025-06-13T10:30:00"])
    isRead: bool = Field(alias="isRead")

    model_config = {"from_attributes": True, "populate_by_name": True}


class NotificationReadResponse(BaseModel):
    success: bool


# ── Request Update / Delete ─────────────────────────────


class RequestUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, min_length=1)
    category: str | None = None
    region: str | None = None

    model_config = {"populate_by_name": True}


class RequestDeleteResponse(BaseModel):
    success: bool


# ── Pagination ──────────────────────────────────────────


class PaginatedRequestResponse(BaseModel):
    items: list[RequestResponse]
    total: int = Field(ge=0)
    limit: int = Field(ge=0)
    offset: int = Field(ge=0)


# ── User Stats ──────────────────────────────────────────


class UserStatsResponse(BaseModel):
    totalLikesReceived: int = Field(alias="totalLikesReceived", ge=0)
    totalRequests: int = Field(alias="totalRequests", ge=0)

    model_config = {"populate_by_name": True}
