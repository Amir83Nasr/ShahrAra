from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_405_METHOD_NOT_ALLOWED,
    HTTP_422_UNPROCESSABLE_CONTENT,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

PERSIAN_ERRORS: dict[int, str] = {
    HTTP_400_BAD_REQUEST: "اطلاعات ارسالی معتبر نیست. لطفاً ورودی‌ها را بررسی کنید.",
    HTTP_401_UNAUTHORIZED: "شما دسترسی ندارید. لطفاً وارد حساب کاربری خود شوید.",
    HTTP_403_FORBIDDEN: "شما مجوز دسترسی به این بخش را ندارید.",
    HTTP_404_NOT_FOUND: "مورد درخواستی یافت نشد.",
    HTTP_405_METHOD_NOT_ALLOWED: "این روش درخواست برای این مسیر پشتیبانی نمی‌شود.",
    HTTP_422_UNPROCESSABLE_CONTENT: "داده‌های ارسالی از نظر ساختاری مشکل دارند.",
    HTTP_500_INTERNAL_SERVER_ERROR: "خطایی در سرور رخ داده است. لطفاً بعداً تلاش کنید.",
}

# Default HTTP status phrases from Starlette that should be overridden
_DEFAULT_PHRASES = frozenset({
    "Not Found",
    "Method Not Allowed",
    "Forbidden",
    "Unauthorized",
    "Bad Request",
    "Unprocessable Entity",
    "Internal Server Error",
})


def persian_error_detail(status_code: int, detail: str | None = None) -> str:
    if detail and detail not in _DEFAULT_PHRASES:
        return detail
    return PERSIAN_ERRORS.get(status_code, "خطای ناشناخته‌ای رخ داده است.")


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.status_code,
                "message": persian_error_detail(exc.status_code, exc.detail),
            },
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    field_errors = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err.get("loc", []))
        field_errors.append({
            "field": field,
            "message": err.get("msg", "مقدار نامعتبر"),
        })

    return JSONResponse(
        status_code=HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "success": False,
            "error": {
                "code": HTTP_422_UNPROCESSABLE_CONTENT,
                "message": PERSIAN_ERRORS[HTTP_422_UNPROCESSABLE_CONTENT],
                "fields": field_errors,
            },
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": HTTP_500_INTERNAL_SERVER_ERROR,
                "message": PERSIAN_ERRORS[HTTP_500_INTERNAL_SERVER_ERROR],
            },
        },
    )
