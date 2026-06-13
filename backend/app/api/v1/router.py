from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Request
from app.schemas.schemas import StatsResponse

from .endpoints import auth, requests

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(requests.router, prefix="/requests")


@api_router.get(
    "/stats",
    response_model=StatsResponse,
    summary="Aggregate statistics",
    description="Get total counts, breakdown by type, status, and category.",
)
def get_stats(db: Session = Depends(get_db)):
    all_requests = db.query(Request).all()
    total_count = len(all_requests)
    problems_count = len([r for r in all_requests if r.type == "problem"])
    ideas_count = len([r for r in all_requests if r.type == "idea"])

    statuses = ["submitted", "under_review", "in_progress", "resolved", "archived"]
    by_status = {s: len([r for r in all_requests if r.status == s]) for s in statuses}

    by_category = {}
    for r in all_requests:
        by_category[r.category] = by_category.get(r.category, 0) + 1

    return StatsResponse(
        totalCount=total_count,
        problemsCount=problems_count,
        ideasCount=ideas_count,
        byStatus=by_status,
        byCategory=by_category,
    )
