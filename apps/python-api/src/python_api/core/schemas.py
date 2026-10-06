from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ApiModel(BaseModel):
    """Base contract that accepts the existing camelCase JSON fields."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")


class PageRequest(ApiModel):
    """Provides the common one-based pagination constraints."""

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, alias="pageSize", ge=1, le=100)


def json_value(value: Any) -> Any:
    """Converts database values to the JSON representation emitted by NestJS."""
    if isinstance(value, datetime):
        return value.isoformat().replace("+00:00", "Z")
    if isinstance(value, list):
        return [json_value(item) for item in value]
    if isinstance(value, dict):
        return {key: json_value(item) for key, item in value.items()}
    return value
