"""Reusable OpenAPI response declarations.

Every failure path answers with the same :class:`ErrorResponse` envelope, so
endpoints reference these helpers instead of repeating inline descriptions.
"""

from __future__ import annotations

from app.schemas.errors import ErrorResponse

_DESCRIPTIONS = {
    400: "The request is invalid or no longer valid.",
    401: "Authentication is required or the credentials were rejected.",
    403: "The signed-in user is not allowed to perform this action.",
    404: "The requested resource does not exist.",
    422: "One or more inputs failed validation.",
    500: "Unexpected server error.",
}

_EXAMPLES = {
    400: {
        "success": False,
        "error": {
            "code": 400,
            "message": "اطلاعات ارسالی معتبر نیست. لطفاً ورودی‌ها را بررسی کنید.",
        },
    },
    401: {
        "success": False,
        "error": {
            "code": 401,
            "message": "شما دسترسی ندارید. لطفاً وارد حساب کاربری خود شوید.",
        },
    },
    403: {
        "success": False,
        "error": {
            "code": 403,
            "message": "شما مجوز دسترسی به این بخش را ندارید.",
        },
    },
    404: {
        "success": False,
        "error": {
            "code": 404,
            "message": "مورد درخواستی یافت نشد.",
        },
    },
    422: {
        "success": False,
        "error": {
            "code": 422,
            "message": "داده‌های ارسالی از نظر ساختاری مشکل دارند.",
            "fields": [
                {
                    "field": "body.phone",
                    "message": "String should match pattern '^09\\d{9}$'",
                }
            ],
        },
    },
    500: {
        "success": False,
        "error": {
            "code": 500,
            "message": "خطایی در سرور رخ داده است. لطفاً بعداً تلاش کنید.",
        },
    },
}


def error_responses(*codes: int) -> dict[int, dict]:
    """Build the ``responses`` mapping for the given HTTP status codes."""
    return {
        code: {
            "model": ErrorResponse,
            "description": _DESCRIPTIONS[code],
            "content": {"application/json": {"example": _EXAMPLES[code]}},
        }
        for code in codes
    }
