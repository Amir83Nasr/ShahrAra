from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Request
from app.schemas.schemas import StatsResponse

from .endpoints import auth, notifications, requests

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(requests.router, prefix="/requests")
api_router.include_router(notifications.router, prefix="/notifications")

ALL_STATUSES = ["submitted", "under_review", "in_progress", "resolved", "archived"]


@api_router.get(
    "/stats",
    response_model=StatsResponse,
    summary="Aggregate statistics",
    description="Get total counts, breakdown by type, status, and category.",
    tags=["stats"],
)
def get_stats(db: Session = Depends(get_db)):
    total_count = db.query(func.count(Request.id)).scalar()

    type_counts = dict(db.query(Request.type, func.count(Request.id)).group_by(Request.type).all())
    problems_count = type_counts.get("problem", 0)
    ideas_count = type_counts.get("idea", 0)

    status_counts = dict(
        db.query(Request.status, func.count(Request.id)).group_by(Request.status).all()
    )
    by_status = {s: status_counts.get(s, 0) for s in ALL_STATUSES}

    by_category = dict(
        db.query(Request.category, func.count(Request.id)).group_by(Request.category).all()
    )

    return StatsResponse(
        totalCount=total_count,
        problemsCount=problems_count,
        ideasCount=ideas_count,
        byStatus=by_status,
        byCategory=by_category,
    )
