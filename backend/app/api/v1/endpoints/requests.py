from __future__ import annotations

from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.api.responses import error_responses
from app.core.security import get_current_user, require_admin, require_user
from app.db.session import get_db
from app.models.models import Like, Notification, Request, User
from app.schemas.schemas import (
    CreateRequestResponse,
    LikeResponse,
    PaginatedRequestResponse,
    RequestCreate,
    RequestDeleteResponse,
    RequestResponse,
    RequestStatus,
    RequestType,
    RequestUpdate,
    StatusUpdate,
    StatusUpdateResponse,
    UserStatsResponse,
)

router = APIRouter(tags=["Requests"])


@router.get(
    "",
    response_model=list[RequestResponse] | PaginatedRequestResponse,
    summary="List requests",
    description="Browse requests with search, filters, sorting, and optional pagination. "
    "Returns a flat list when `limit=0` and a paginated envelope when `limit>0`.",
    operation_id="requests_list",
    response_description="A flat list, or a paginated envelope when `limit` is greater than zero.",
    responses=error_responses(422),
)
def get_requests(
    search: str | None = Query(
        None,
        description="Case-insensitive match on title, description, or region.",
        examples=["pothole"],
    ),
    type: RequestType | None = Query(None, description="Filter by submission type."),
    category: str | None = Query(
        None,
        description="Filter by category (exact match).",
        examples=["Asphalt & Roads"],
    ),
    status: RequestStatus | None = Query(None, description="Filter by lifecycle state."),
    userPhone: str | None = Query(
        None,
        alias="userPhone",
        description="Only requests submitted by this phone.",
        examples=["09123456789"],
    ),
    currentUserPhone: str | None = Query(
        None,
        alias="currentUserPhone",
        description="When set, each item includes `likedByCurrentUser` for this phone.",
        examples=["09123456789"],
    ),
    likedByUser: str | None = Query(
        None,
        alias="likedByUser",
        description="Only requests liked by this phone.",
        examples=["09123456789"],
    ),
    limit: int = Query(
        0,
        ge=0,
        description="Page size. `0` disables pagination and returns a flat list.",
        examples=[10],
    ),
    offset: int = Query(0, ge=0, description="Number of matches to skip.", examples=[0]),
    sort_by: Literal["created_at", "likes"] = Query("created_at", description="Sort field."),
    sort_order: Literal["asc", "desc"] = Query("desc", description="Sort direction."),
    start_date: datetime | None = Query(
        None,
        alias="startDate",
        description="Only include requests created on or after this date (ISO 8601).",
        examples=["2025-06-01"],
    ),
    end_date: datetime | None = Query(
        None,
        alias="endDate",
        description="Only include requests created on or before this date (end of day).",
        examples=["2025-06-30"],
    ),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    query = db.query(Request)

    if search:
        term = f"%{search}%"
        query = query.filter(
            Request.title.ilike(term) | Request.description.ilike(term) | Request.region.ilike(term)
        )

    if type:
        query = query.filter(Request.type == type.value)
    if category:
        query = query.filter(Request.category == category)
    if status:
        query = query.filter(Request.status == status.value)
    if userPhone:
        query = query.filter(Request.user_phone == userPhone)
    if likedByUser:
        liked_req_ids = [
            like.request_id for like in db.query(Like).filter(Like.user_phone == likedByUser).all()
        ]
        query = query.filter(Request.id.in_(liked_req_ids))
    if start_date:
        query = query.filter(Request.created_at >= start_date)
    if end_date:
        query = query.filter(Request.created_at <= end_date.replace(hour=23, minute=59, second=59))

    total = query.count()

    # Sorting
    sort_column = Request.created_at if sort_by == "created_at" else Request.likes
    sort_method = sort_column.desc() if sort_order == "desc" else sort_column.asc()
    query = query.order_by(sort_method)

    # Pagination
    if limit > 0:
        query = query.offset(offset).limit(limit)

    results = query.all()

    # likedByCurrentUser: trust the bearer token first; keep the legacy
    # currentUserPhone query parameter only for unauthenticated clients.
    liked_by_phone = current_user.phone if current_user else currentUserPhone
    liked_ids: set[str] = set()
    if liked_by_phone:
        liked_ids = {
            like.request_id
            for like in db.query(Like).filter(Like.user_phone == liked_by_phone).all()
        }

    items = [
        RequestResponse.from_orm(
            r,
            liked_by_current_user=(r.id in liked_ids) if liked_by_phone else None,
            viewer=current_user,
        )
        for r in results
    ]

    if limit > 0:
        return PaginatedRequestResponse(items=items, total=total, limit=limit, offset=offset)

    return items


@router.post(
    "",
    response_model=CreateRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a request",
    description="Submit an urban problem or an improvement idea with map coordinates. "
    "The owner is taken from the access token.",
    operation_id="requests_create",
    response_description="The newly created request.",
    responses=error_responses(401, 422),
)
def create_request(
    request_data: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    region = request_data.region or "Central District"

    new_request = Request(
        title=request_data.title,
        description=request_data.description,
        type=request_data.type.value if hasattr(request_data.type, "value") else request_data.type,
        category=request_data.category,
        lat=str(request_data.coordinates.lat),
        lng=str(request_data.coordinates.lng),
        region=region,
        user_phone=current_user.phone,
        user_name=f"{current_user.firstName} {current_user.lastName}",
        status="submitted",
        likes=0,
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return CreateRequestResponse(
        success=True,
        request=RequestResponse.from_orm(new_request, viewer=current_user),
    )


@router.put(
    "/{request_id}",
    response_model=RequestResponse,
    summary="Update a request",
    description="Edit title, description, category, or region of your own request. "
    "Only allowed while the status is `submitted` or `under_review`.",
    operation_id="requests_update",
    response_description="The updated request.",
    responses=error_responses(403, 404, 422),
)
def update_request(
    update_data: RequestUpdate,
    request_id: str = Path(..., description="Request identifier.", examples=["req_x1y2z3w4"]),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="درخواست مورد نظر یافت نشد.",
        )

    if not current_user or current_user.phone != req.user_phone:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما فقط می‌توانید درخواست‌های خود را ویرایش کنید.",
        )

    if req.status not in ("submitted", "under_review"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="این درخواست در وضعیت فعلی قابل ویرایش نیست.",
        )

    if update_data.title is not None:
        req.title = update_data.title
    if update_data.description is not None:
        req.description = update_data.description
    if update_data.category is not None:
        req.category = update_data.category
    if update_data.region is not None:
        req.region = update_data.region

    db.commit()
    db.refresh(req)

    liked_by_current_user = (
        db.query(Like)
        .filter(Like.user_phone == current_user.phone, Like.request_id == req.id)
        .first()
        is not None
    )

    return RequestResponse.from_orm(
        req, liked_by_current_user=liked_by_current_user, viewer=current_user
    )


@router.delete(
    "/{request_id}",
    response_model=RequestDeleteResponse,
    summary="Delete a request",
    description="Delete your own request. Only allowed while the status is `submitted`.",
    operation_id="requests_delete",
    response_description="The request was deleted.",
    responses=error_responses(403, 404),
)
def delete_request(
    request_id: str = Path(..., description="Request identifier.", examples=["req_x1y2z3w4"]),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="درخواست مورد نظر یافت نشد.",
        )

    if not current_user or current_user.phone != req.user_phone:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما فقط می‌توانید درخواست‌های خود را حذف کنید.",
        )

    if req.status != "submitted":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='فقط درخواست‌های با وضعیت "ثبت شده" قابل حذف هستند.',
        )

    # Remove child rows explicitly as well as via the FK rules, so the endpoint
    # also works against databases created before the cascade migration.
    db.query(Notification).filter(Notification.request_id == request_id).delete()
    db.query(Like).filter(Like.request_id == request_id).delete()
    db.delete(req)
    db.commit()

    return RequestDeleteResponse(success=True)


@router.get(
    "/user/{user_phone}/stats",
    response_model=UserStatsResponse,
    summary="Get user statistics",
    description="Total likes received and total requests submitted by a phone number.",
    operation_id="requests_user_stats",
    response_description="Aggregate counters for the user.",
)
def get_user_stats(
    user_phone: str = Path(
        ...,
        description="Phone number of the citizen.",
        examples=["09123456789"],
    ),
    db: Session = Depends(get_db),
):
    user_requests = db.query(Request).filter(Request.user_phone == user_phone).all()
    total_likes = sum(r.likes for r in user_requests)
    return UserStatsResponse(
        totalLikesReceived=total_likes,
        totalRequests=len(user_requests),
    )


@router.put(
    "/{request_id}/status",
    response_model=StatusUpdateResponse,
    summary="Update request status (admin only)",
    description="Move a request through its lifecycle and optionally add an admin note. "
    "The owner is notified automatically. Requires an admin token.",
    operation_id="requests_update_status",
    response_description="The updated request.",
    responses=error_responses(403, 404, 422),
)
def update_status(
    status_update: StatusUpdate,
    request_id: str = Path(..., description="Request identifier.", examples=["req_x1y2z3w4"]),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="درخواست مورد نظر یافت نشد.",
        )

    old_status = req.status
    old_response = req.admin_response
    new_status = (
        status_update.status.value
        if hasattr(status_update.status, "value")
        else status_update.status
    )
    req.status = new_status
    if status_update.adminResponse is not None:
        req.admin_response = status_update.adminResponse

    db.commit()
    db.refresh(req)

    status_changed = old_status != req.status
    response_changed = old_response != req.admin_response

    # Notify only on a real change — repeated saves used to spam the owner.
    if (status_changed or response_changed) and req.user_phone != admin.phone:
        if status_changed:
            status_label = {
                "submitted": "ثبت شده",
                "under_review": "در حال بررسی",
                "in_progress": "در حال اجرا",
                "resolved": "حل شده",
                "archived": "بایگانی‌شده",
            }.get(req.status, req.status)
            message = f"وضعیت درخواست شما به «{status_label}» تغییر یافت."
        else:
            message = "پاسخ رسمی جدیدی برای درخواست شما ثبت شد."
        notification = Notification(
            user_phone=req.user_phone,
            message=message,
            request_id=req.id,
            request_title=req.title,
        )
        db.add(notification)
        db.commit()

    return StatusUpdateResponse(success=True, request=RequestResponse.from_orm(req, viewer=admin))


@router.post(
    "/{request_id}/like",
    response_model=LikeResponse,
    summary="Toggle a like",
    description="Likes the request if the signed-in user has not liked it yet, "
    "otherwise removes the like.",
    operation_id="requests_toggle_like",
    response_description="The request with the updated like count.",
    responses=error_responses(401, 404),
)
def toggle_like(
    request_id: str = Path(..., description="Request identifier.", examples=["req_x1y2z3w4"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="درخواست مورد نظر یافت نشد.",
        )

    existing = (
        db.query(Like)
        .filter(
            Like.user_phone == current_user.phone,
            Like.request_id == request_id,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        req.likes = max(0, req.likes - 1)
    else:
        db.add(Like(user_phone=current_user.phone, request_id=request_id))
        req.likes += 1

    db.commit()
    db.refresh(req)

    liked_by_current_user = existing is None

    return LikeResponse(
        success=True,
        request=RequestResponse.from_orm(
            req, liked_by_current_user=liked_by_current_user, viewer=current_user
        ),
    )
