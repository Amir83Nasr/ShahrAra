from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_admin
from app.db.session import get_db
from app.models.models import Like, Notification, Request, User
from app.schemas.schemas import (
    CreateRequestResponse,
    LikeRequest,
    LikeResponse,
    PaginatedRequestResponse,
    RequestCreate,
    RequestDeleteResponse,
    RequestResponse,
    RequestUpdate,
    StatusUpdate,
    StatusUpdateResponse,
    UserStatsResponse,
)

router = APIRouter(tags=["requests"])


@router.get(
    "",
    response_model=list[RequestResponse] | PaginatedRequestResponse,
    summary="List all requests",
    description="Get all requests with optional search, type, category, status, userPhone, "
    "likedByUser, date range, sort, and pagination filters. "
    "When limit>0 returns paginated wrapper; when limit=0 returns flat list (backward compat).",
)
def get_requests(
    search: str | None = Query(None, description="Search in title, description, and region"),
    type: str | None = Query(None, description="Filter by type (problem / idea)"),
    category: str | None = Query(None, description="Filter by category"),
    status: str | None = Query(None, description="Filter by status"),
    userPhone: str | None = Query(
        None, alias="userPhone", description="Filter by user phone number"
    ),
    currentUserPhone: str | None = Query(
        None,
        alias="currentUserPhone",
        description="Phone of current user to compute likedByCurrentUser",
    ),
    likedByUser: str | None = Query(
        None,
        alias="likedByUser",
        description="Return only requests liked by this user's phone",
    ),
    limit: int = Query(0, ge=0, description="Max results (0 = no limit, return flat list)"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    sort_by: str = Query("created_at", description="Sort field: created_at or likes"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    start_date: str | None = Query(
        None,
        alias="startDate",
        description="Filter by created_at >= this ISO date (e.g. 2025-06-01)",
    ),
    end_date: str | None = Query(
        None, alias="endDate", description="Filter by created_at <= this ISO date (e.g. 2025-06-23)"
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Request)

    if search:
        term = f"%{search}%"
        query = query.filter(
            Request.title.ilike(term) | Request.description.ilike(term) | Request.region.ilike(term)
        )

    if type:
        query = query.filter(Request.type == type)
    if category:
        query = query.filter(Request.category == category)
    if status:
        query = query.filter(Request.status == status)
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
        query = query.filter(Request.created_at <= f"{end_date}T23:59:59")

    total = query.count()

    # Sorting
    sort_column = Request.created_at if sort_by == "created_at" else Request.likes
    sort_method = sort_column.desc() if sort_order == "desc" else sort_column.asc()
    query = query.order_by(sort_method)

    # Pagination
    if limit > 0:
        query = query.offset(offset).limit(limit)

    results = query.all()

    # likedByCurrentUser enrichment
    if currentUserPhone:
        liked_ids = set(
            like.request_id
            for like in db.query(Like).filter(Like.user_phone == currentUserPhone).all()
        )
        items = [
            RequestResponse.from_orm(r, liked_by_current_user=r.id in liked_ids) for r in results
        ]
    else:
        items = [RequestResponse.from_orm(r) for r in results]

    if limit > 0:
        return PaginatedRequestResponse(items=items, total=total, limit=limit, offset=offset)

    return items


@router.post(
    "",
    response_model=CreateRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new request",
    description="Submit a new urban problem or improvement idea with location coordinates.",
    responses={400: {"description": "داده‌های ورودی نامعتبر است"}},
)
def create_request(request_data: RequestCreate, db: Session = Depends(get_db)):
    region = request_data.region or "Central District"

    new_request = Request(
        title=request_data.title,
        description=request_data.description,
        type=request_data.type.value if hasattr(request_data.type, "value") else request_data.type,
        category=request_data.category,
        lat=str(request_data.coordinates.lat),
        lng=str(request_data.coordinates.lng),
        region=region,
        user_phone=request_data.userPhone,
        user_name=request_data.userName,
        status="submitted",
        likes=0,
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return CreateRequestResponse(success=True, request=RequestResponse.from_orm(new_request))


@router.put(
    "/{request_id}",
    response_model=RequestResponse,
    summary="Update a request",
    description="Edit title, description, category, or region of your own request. "
    "Only allowed for 'submitted' or 'under_review' status.",
    responses={
        403: {"description": "شما اجازه ویرایش این درخواست را ندارید"},
        404: {"description": "درخواست مورد نظر یافت نشد"},
    },
)
def update_request(
    request_id: str,
    update_data: RequestUpdate,
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

    return RequestResponse.from_orm(req, liked_by_current_user=liked_by_current_user)


@router.delete(
    "/{request_id}",
    response_model=RequestDeleteResponse,
    summary="Delete a request",
    description="Delete your own request. Only allowed for 'submitted' status.",
    responses={
        403: {"description": "شما اجازه حذف این درخواست را ندارید"},
        404: {"description": "درخواست مورد نظر یافت نشد"},
    },
)
def delete_request(
    request_id: str,
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

    # Delete associated likes first
    db.query(Like).filter(Like.request_id == request_id).delete()
    db.delete(req)
    db.commit()

    return RequestDeleteResponse(success=True)


@router.get(
    "/user/{user_phone}/stats",
    response_model=UserStatsResponse,
    summary="Get user stats",
    description="Total likes received on all user's requests and total request count.",
)
def get_user_stats(user_phone: str, db: Session = Depends(get_db)):
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
    description="Change the status of a request. Requires admin Bearer token. "
    "You can also add an admin response.",
    responses={
        403: {"description": "دسترسی نیازمند حساب مدیر است"},
        404: {"description": "درخواست مورد نظر یافت نشد"},
    },
)
def update_status(
    request_id: str,
    status_update: StatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="درخواست مورد نظر یافت نشد.",
        )

    req.status = (
        status_update.status.value
        if hasattr(status_update.status, "value")
        else status_update.status
    )
    if status_update.adminResponse is not None:
        req.admin_response = status_update.adminResponse

    db.commit()
    db.refresh(req)

    # Auto-create notification for request owner
    if req.user_phone != admin.phone:
        status_label = {
            "submitted": "ثبت شده",
            "under_review": "در حال بررسی",
            "in_progress": "در حال انجام",
            "resolved": "حل شده",
            "archived": "بایگانی شده",
        }.get(req.status, req.status)
        notification = Notification(
            user_phone=req.user_phone,
            message=f"وضعیت درخواست شما به «{status_label}» تغییر یافت.",
            request_id=req.id,
            request_title=req.title,
        )
        db.add(notification)
        db.commit()

    return StatusUpdateResponse(success=True, request=RequestResponse.from_orm(req))


@router.post(
    "/{request_id}/like",
    response_model=LikeResponse,
    summary="Toggle like on a request",
    description="Like or unlike a request. Toggles per user based on their phone number.",
    responses={404: {"description": "درخواست مورد نظر یافت نشد"}},
)
def toggle_like(request_id: str, like_data: LikeRequest, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="درخواست مورد نظر یافت نشد.",
        )

    existing = (
        db.query(Like)
        .filter(
            Like.user_phone == like_data.userPhone,
            Like.request_id == request_id,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        req.likes = max(0, req.likes - 1)
    else:
        db.add(Like(user_phone=like_data.userPhone, request_id=request_id))
        req.likes += 1

    db.commit()
    db.refresh(req)

    liked_by_current_user = existing is None

    return LikeResponse(
        success=True,
        request=RequestResponse.from_orm(req, liked_by_current_user=liked_by_current_user),
    )
