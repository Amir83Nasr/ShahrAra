from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Request
from app.schemas.schemas import RequestCreate

router = APIRouter()


def make_request_response(r: Request) -> dict:
    return {
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "type": r.type,
        "category": r.category,
        "coordinates": {"lat": float(r.lat), "lng": float(r.lng)},
        "region": r.region,
        "status": r.status,
        "userPhone": r.user_phone,
        "userName": r.user_name,
        "createdAt": r.created_at.isoformat() if r.created_at else "",
        "adminResponse": r.admin_response,
        "likes": r.likes,
    }


@router.get("")
def get_requests(
    search: Optional[str] = None,
    type: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    userPhone: Optional[str] = None,
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

    return [make_request_response(r) for r in query.order_by(Request.created_at.desc()).all()]


@router.post("")
def create_request(request_data: RequestCreate, db: Session = Depends(get_db)):
    region = request_data.region or "منطقه مرکزی"

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
    return {"success": True, "request": make_request_response(new_request)}


@router.put("/{request_id}/status")
def update_status(request_id: str, status_update: dict, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="درخواست مورد نظر یافت نشد.")

    new_status = status_update.get("status")
    admin_response = status_update.get("adminResponse")

    if not new_status:
        raise HTTPException(status_code=400, detail="وضعیت انتخاب نشده است.")

    req.status = new_status
    if admin_response is not None:
        req.admin_response = admin_response

    db.commit()
    db.refresh(req)
    return {"success": True, "request": make_request_response(req)}


@router.post("/{request_id}/like")
def toggle_like(request_id: str, like_data: dict, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="درخواست یافت نشد.")

    user_phone = like_data.get("userPhone")
    if not user_phone:
        raise HTTPException(status_code=400, detail="تلفن کاربر الزامی است.")

    req.likes += 1
    db.commit()
    db.refresh(req)
    return {"success": True, "request": make_request_response(req)}
