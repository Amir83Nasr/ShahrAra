from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.db.session import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ShahrAra API",
    description="سامانه ثبت و پیگیری نیازها و ایده‌های مردمی به شهرداری‌ها",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
