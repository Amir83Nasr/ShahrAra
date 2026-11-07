"""Shared error envelope returned by every failure path.

The handlers in :mod:`app.core.errors` always answer with the same shape, so the
OpenAPI schema can describe it once and reference it from every operation.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class ErrorField(BaseModel):
    """A single invalid input field (422 responses only)."""

    field: str = Field(
        ...,
        description="Dot-separated path to the offending input field.",
        examples=["body.phone"],
    )
    message: str = Field(
        ...,
        description="Human-readable reason the value was rejected.",
        examples=["String should match pattern '^09\\d{9}$'"],
    )


class ErrorBody(BaseModel):
    code: int = Field(
        ...,
        description="HTTP status code, repeated for client convenience.",
        examples=[404],
    )
    message: str = Field(
        ...,
        description="Persian, user-displayable error message.",
        examples=["درخواست مورد نظر یافت نشد."],
    )
    fields: list[ErrorField] | None = Field(
        None,
        description="Field-level validation errors. Present on 422 responses only.",
    )


class ErrorResponse(BaseModel):
    """Uniform envelope for every non-2xx response."""

    success: bool = Field(False, description="Always `false` for errors.")
    error: ErrorBody

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": False,
                "error": {
                    "code": 404,
                    "message": "درخواست مورد نظر یافت نشد.",
                },
            }
        }
    }
