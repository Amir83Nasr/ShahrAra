from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.api.responses import error_responses
from app.core.security import require_user
from app.db.session import get_db
from app.models.models import Notification, User
from app.schemas.schemas import NotificationReadResponse, NotificationResponse

router = APIRouter(tags=["Notifications"])


@router.get(
    "",
    response_model=list[NotificationResponse],
    summary="List notifications",
    description="Notifications for the signed-in user, newest first. Unread-only by default.",
    operation_id="notifications_list",
    response_description="Notifications visible to the caller.",
    responses=error_responses(401),
)
def get_notifications(
    includeRead: bool = Query(
        False,
        alias="includeRead",
        description="Include notifications that have already been read.",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    query = db.query(Notification).filter(Notification.user_phone == current_user.phone)

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
    "/read-all",
    response_model=NotificationReadResponse,
    summary="Mark all notifications as read",
    description="Marks every unread notification of the signed-in user as read.",
    operation_id="notifications_mark_all_read",
    response_description="All currently unread notifications are marked as read.",
    responses=error_responses(401),
)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    db.query(Notification).filter(
        Notification.user_phone == current_user.phone,
        Notification.is_read.is_(False),
    ).update({Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return NotificationReadResponse(success=True)


@router.put(
    "/{notification_id}/read",
    response_model=NotificationReadResponse,
    summary="Mark a notification as read",
    operation_id="notifications_mark_read",
    response_description="The notification is now marked as read.",
    responses=error_responses(401, 403, 404),
)
def mark_notification_read(
    notification_id: str = Path(
        ...,
        description="Notification identifier.",
        examples=["ntf_a1b2c3d4"],
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="اعلان مورد نظر یافت نشد.",
        )

    if notification.user_phone != current_user.phone:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما اجازه دسترسی به این اعلان را ندارید.",
        )

    notification.is_read = True
    db.commit()
    return NotificationReadResponse(success=True)
