from __future__ import annotations

from enum import Enum as PyEnum

from pydantic import BaseModel, Field


class RequestType(str, PyEnum):
    """Kind of citizen submission."""

    problem = "problem"
    idea = "idea"


class RequestStatus(str, PyEnum):
    """Lifecycle state of a request."""

    submitted = "submitted"
    under_review = "under_review"
    in_progress = "in_progress"
    resolved = "resolved"
    archived = "archived"


class Coordinates(BaseModel):
    """WGS-84 coordinates of the reported location."""

    lat: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Latitude in decimal degrees.",
        examples=[35.7219],
    )
    lng: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Longitude in decimal degrees.",
        examples=[51.3347],
    )

    model_config = {"json_schema_extra": {"example": {"lat": 35.7219, "lng": 51.3347}}}


# ── Auth: OTP + Password ────────────────────────────────

PHONE_PATTERN = r"^09\d{9}$"


class CheckPhoneRequest(BaseModel):
    phone: str = Field(
        ...,
        pattern=PHONE_PATTERN,
        description="Iranian mobile number, digits only.",
        examples=["09123456789"],
    )


class CheckPhoneResponse(BaseModel):
    exists: bool = Field(
        ...,
        description="Whether the phone is already registered.",
        examples=[True],
    )
    hasPassword: bool = Field(
        ...,
        description="Whether the account can sign in with a password.",
        examples=[False],
    )


class OtpRequest(BaseModel):
    phone: str = Field(
        ...,
        pattern=PHONE_PATTERN,
        description="Iranian mobile number, digits only.",
        examples=["09123456789"],
    )

    model_config = {
        "json_schema_extra": {"example": {"phone": "09123456789"}},
    }


class OtpRequestResponse(BaseModel):
    success: bool = Field(True, description="The code was created.", examples=[True])
    expiresInSeconds: int = Field(
        ...,
        description="Seconds until the code expires.",
        examples=[120],
    )
    devCode: str | None = Field(
        None,
        description="The code itself, returned only when `OTP_DEV_MODE` is enabled.",
        examples=["123456"],
    )


class OtpVerifyRequest(BaseModel):
    phone: str = Field(
        ...,
        pattern=PHONE_PATTERN,
        description="Iranian mobile number, digits only.",
        examples=["09123456789"],
    )
    code: str = Field(
        ...,
        pattern=r"^\d{6}$",
        description="The six-digit code from the OTP request.",
        examples=["123456"],
    )
    # Required only when the phone is not registered yet (first-time entry).
    firstName: str | None = Field(
        None,
        alias="firstName",
        min_length=1,
        description="Required only when registering a new account.",
        examples=["Ali"],
    )
    lastName: str | None = Field(
        None,
        alias="lastName",
        min_length=1,
        description="Required only when registering a new account.",
        examples=["Rezaei"],
    )
    nationalId: str | None = Field(
        None,
        alias="nationalId",
        pattern=r"^\d{10}$",
        description="Required only when registering a new account.",
        examples=["1234567890"],
    )

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "phone": "09123456789",
                "code": "123456",
                "firstName": "Ali",
                "lastName": "Rezaei",
                "nationalId": "1234567890",
            }
        },
    }


class PasswordLoginRequest(BaseModel):
    phone: str = Field(
        ...,
        pattern=PHONE_PATTERN,
        description="Iranian mobile number, digits only.",
        examples=["09123456789"],
    )
    password: str = Field(
        ...,
        min_length=1,
        max_length=72,
        description="Account password.",
        examples=["Str0ngPass!"],
    )

    model_config = {
        "json_schema_extra": {"example": {"phone": "09123456789", "password": "Str0ngPass!"}},
    }


class PasswordChangeRequest(BaseModel):
    currentPassword: str | None = Field(
        None,
        alias="currentPassword",
        max_length=72,
        description="Required when the account already has a password.",
    )
    newPassword: str = Field(
        alias="newPassword",
        min_length=8,
        max_length=72,
        description="New password, 8–72 characters.",
        examples=["Str0ngPass!"],
    )

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {"currentPassword": "OldPass!23", "newPassword": "Str0ngPass!"}
        },
    }


class PasswordChangeResponse(BaseModel):
    success: bool = Field(True, examples=[True])
    user: UserResponse


class UserResponse(BaseModel):
    id: str = Field(description="User identifier.", examples=["usr_a1b2c3d4"])
    phone: str = Field(description="Registered mobile number.", examples=["09123456789"])
    nationalId: str = Field(
        alias="nationalId",
        description="National ID (کد ملی).",
        examples=["1234567890"],
    )
    firstName: str = Field(alias="firstName", description="Given name.", examples=["Ali"])
    lastName: str = Field(alias="lastName", description="Family name.", examples=["Rezaei"])
    isAdmin: bool = Field(
        alias="isAdmin",
        description="Whether the account can manage requests.",
    )
    hasPassword: bool = Field(
        alias="hasPassword",
        description="Whether a password has been set for password sign-in.",
    )

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "usr_a1b2c3d4",
                "phone": "09123456789",
                "nationalId": "1234567890",
                "firstName": "Ali",
                "lastName": "Rezaei",
                "isAdmin": False,
                "hasPassword": False,
            }
        },
    }


class TokenResponse(BaseModel):
    accessToken: str = Field(
        alias="accessToken",
        description="JWT to send as `Authorization: Bearer <token>`.",
        examples=["eyJhbGciOiJIUzI1NiIs..."],
    )
    tokenType: str = Field(alias="tokenType", default="bearer", examples=["bearer"])

    model_config = {"populate_by_name": True}


class LoginResponse(BaseModel):
    success: bool = Field(True, examples=[True])
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
                    "hasPassword": False,
                },
            }
        }
    }


class RequestCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Short, specific title.",
        examples=["Pothole on Valiasr Street"],
    )
    description: str = Field(
        ...,
        min_length=1,
        description="What is wrong, where, and since when.",
        examples=[
            "The asphalt on Valiasr Street near Vanak Square has been damaged "
            "for months and needs urgent repair."
        ],
    )
    type: RequestType = Field(..., description="Report a problem or propose an idea.")
    category: str = Field(
        ...,
        description="Free-form service category, e.g. roads, lighting, or beautification.",
        examples=["Asphalt & Roads"],
    )
    coordinates: Coordinates = Field(..., description="Where the issue is located.")
    region: str = Field(
        default="",
        description="District or neighbourhood name. Defaults to `Central District`.",
        examples=["District 3"],
    )

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "title": "Pothole on Valiasr Street",
                "description": "The asphalt near Vanak Square has been damaged for months.",
                "type": "problem",
                "category": "Asphalt & Roads",
                "coordinates": {"lat": 35.7219, "lng": 51.3347},
                "region": "District 3",
            }
        },
    }


class RequestResponse(BaseModel):
    id: str = Field(description="Request identifier.", examples=["req_x1y2z3w4"])
    title: str = Field(examples=["Pothole on Valiasr Street"])
    description: str = Field(examples=["The asphalt on Valiasr Street needs repair."])
    type: RequestType
    category: str = Field(examples=["Asphalt & Roads"])
    coordinates: Coordinates
    region: str = Field(examples=["District 3"])
    status: RequestStatus
    userPhone: str = Field(
        alias="userPhone",
        description="Phone of the citizen who submitted the request.",
        examples=["09123456789"],
    )
    userName: str = Field(
        alias="userName",
        description="Display name of the submitting citizen.",
        examples=["Ali Rezaei"],
    )
    createdAt: str = Field(
        alias="createdAt",
        description="Creation timestamp (ISO 8601).",
        examples=["2025-06-13T10:30:00"],
    )
    adminResponse: str | None = Field(
        None,
        alias="adminResponse",
        description="Optional note left by the administrator.",
        examples=["Under review"],
    )
    likes: int = Field(ge=0, description="Number of likes.", examples=[5])
    likedByCurrentUser: bool | None = Field(
        None,
        alias="likedByCurrentUser",
        description="Present only when `currentUserPhone` is supplied.",
    )

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
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
                "likedByCurrentUser": None,
            }
        },
    }

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
    success: bool = Field(True, examples=[True])
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
    status: RequestStatus = Field(..., description="New lifecycle state.")
    adminResponse: str | None = Field(
        None,
        alias="adminResponse",
        description="Optional note shown to the citizen.",
        examples=["Completed successfully"],
    )

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {"status": "in_progress", "adminResponse": "Crew assigned."}
        },
    }


class StatusUpdateResponse(BaseModel):
    success: bool = Field(True, examples=[True])
    request: RequestResponse


class LikeResponse(BaseModel):
    success: bool = Field(True, examples=[True])
    request: RequestResponse


class StatsResponse(BaseModel):
    totalCount: int = Field(ge=0, description="All requests.", examples=[42])
    problemsCount: int = Field(ge=0, description="Requests of type `problem`.", examples=[30])
    ideasCount: int = Field(ge=0, description="Requests of type `idea`.", examples=[12])
    byStatus: dict[str, int] = Field(
        description="Count per lifecycle state.",
        examples=[
            {"submitted": 10, "under_review": 8, "in_progress": 15, "resolved": 7, "archived": 2}
        ],
    )
    byCategory: dict[str, int] = Field(
        description="Count per category.",
        examples=[{"Asphalt & Roads": 15, "Beautification": 10, "Lighting": 5}],
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "totalCount": 42,
                "problemsCount": 30,
                "ideasCount": 12,
                "byStatus": {
                    "submitted": 10,
                    "under_review": 8,
                    "in_progress": 15,
                    "resolved": 7,
                    "archived": 2,
                },
                "byCategory": {"Asphalt & Roads": 15, "Beautification": 10, "Lighting": 5},
            }
        }
    }


# ── Notification ───────────────────────────────────────


class NotificationResponse(BaseModel):
    id: str = Field(description="Notification identifier.", examples=["ntf_a1b2c3d4"])
    userPhone: str = Field(alias="userPhone", examples=["09123456789"])
    message: str = Field(
        description="Persian message ready to display.",
        examples=["وضعیت درخواست شما به «در حال بررسی» تغییر یافت."],
    )
    requestId: str | None = Field(None, alias="requestId", examples=["req_x1y2z3w4"])
    requestTitle: str | None = Field(None, alias="requestTitle", examples=["Pothole repair"])
    createdAt: str = Field(
        alias="createdAt",
        description="Creation timestamp (ISO 8601).",
        examples=["2025-06-13T10:30:00"],
    )
    isRead: bool = Field(alias="isRead", description="Whether the citizen has read it.")

    model_config = {"from_attributes": True, "populate_by_name": True}


class NotificationReadResponse(BaseModel):
    success: bool = Field(True, examples=[True])


# ── Request Update / Delete ─────────────────────────────


class RequestUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200, examples=["Updated title"])
    description: str | None = Field(
        None, min_length=1, examples=["Updated description of the issue."]
    )
    category: str | None = Field(None, examples=["Lighting"])
    region: str | None = Field(None, examples=["District 3"])

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "title": "Updated title",
                "description": "Updated description of the issue.",
                "category": "Lighting",
                "region": "District 3",
            }
        },
    }


class RequestDeleteResponse(BaseModel):
    success: bool = Field(True, examples=[True])


# ── Pagination ──────────────────────────────────────────


class PaginatedRequestResponse(BaseModel):
    items: list[RequestResponse] = Field(description="Requests on the current page.")
    total: int = Field(ge=0, description="Total matches before pagination.")
    limit: int = Field(ge=0, description="Page size used for this response.")
    offset: int = Field(ge=0, description="Number of matches skipped.")

    model_config = {
        "json_schema_extra": {
            "example": {
                "items": [],
                "total": 42,
                "limit": 10,
                "offset": 0,
            }
        }
    }


# ── User Stats ──────────────────────────────────────────


class UserStatsResponse(BaseModel):
    totalLikesReceived: int = Field(
        alias="totalLikesReceived",
        ge=0,
        description="Likes across all of the user's requests.",
        examples=[7],
    )
    totalRequests: int = Field(
        alias="totalRequests",
        ge=0,
        description="Number of requests submitted by the user.",
        examples=[3],
    )

    model_config = {"populate_by_name": True}
