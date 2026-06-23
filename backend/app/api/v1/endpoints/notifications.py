from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Notification
from app.schemas.schemas import NotificationReadResponse, NotificationResponse

router = APIRouter(tags=["notifications"])


@router.get(
    "",
    response_model=list[NotificationResponse],
    summary="Get notifications",
    description="Get notifications for a user, ordered by newest first.",
)
def get_notifications(
    userPhone: str = Query(..., alias="userPhone", description="User phone number"),
    includeRead: bool = Query(False, alias="includeRead", description="Include read notifications"),
    db: Session = Depends(get_db),
):
    query = db.query(Notification).filter(Notification.user_phone == userPhone)

    if not includeRead:
        query = query.filter(Notification.is_read.is_(False))

    results = query.order_by(Notification.created_at.desc()).all()
    return [
        NotificationResponse(
            id=n.id,
            userPhone=n.user_phone,
            message=n.message,
            requestId=n.request_id,
            requestTitle=n.request_title,
            createdAt=n.created_at.isoformat() if n.created_at else "",
            isRead=n.is_read,
        )
        for n in results
    ]


@router.put(
    "/{notification_id}/read",
    response_model=NotificationReadResponse,
    summary="Mark notification as read",
    description="Mark a single notification as read.",
    responses={404: {"description": "اعلان مورد نظر یافت نشد"}},
)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="اعلان مورد نظر یافت نشد.",
        )

    notification.is_read = True
    db.commit()
    return NotificationReadResponse(success=True)
