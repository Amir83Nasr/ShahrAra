from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.db.session import get_db
from app.models.models import Like, Request, User
from app.schemas.schemas import (
    CreateRequestResponse,
    LikeRequest,
    LikeResponse,
    RequestCreate,
    RequestResponse,
    StatusUpdate,
    StatusUpdateResponse,
)

router = APIRouter(tags=["requests"])


@router.get(
    "",
    response_model=list[RequestResponse],
    summary="List all requests",
    description="Get all requests with optional search, type, category, status, and userPhone filters.",
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

    results = query.order_by(Request.created_at.desc()).all()

    if currentUserPhone:
        liked_ids = set(
            like.request_id
            for like in db.query(Like).filter(Like.user_phone == currentUserPhone).all()
        )
        return [
            RequestResponse.from_orm(r, liked_by_current_user=r.id in liked_ids) for r in results
        ]

    return [RequestResponse.from_orm(r) for r in results]


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
    "/{request_id}/status",
    response_model=StatusUpdateResponse,
    summary="Update request status (admin only)",
    description="Change the status of a request. Requires admin Bearer token. You can also add an admin response.",
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
