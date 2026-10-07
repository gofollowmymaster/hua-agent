from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field, StrictBool, field_validator

from python_api.core.schemas import ApiModel, PageRequest


class SystemSkillQuery(ApiModel):
    """Validates optional system Skill keyword filtering."""

    keyword: str | None = None

    @field_validator("keyword", mode="before")
    @classmethod
    def trim_keyword(cls, value: object) -> object:
        """Trims string keywords before applying length constraints."""
        return value.strip() if isinstance(value, str) else value

    @field_validator("keyword")
    @classmethod
    def validate_keyword_length(cls, value: str | None) -> str | None:
        """Applies the NestJS limit after whitespace normalization."""
        if value is not None and len(value) > 64:
            raise ValueError("String should have at most 64 characters")
        return value


class UserSkillPageRequest(PageRequest):
    """Validates current-user Skill pagination and filters."""

    keyword: str | None = Field(default=None, max_length=64)
    is_enabled: StrictBool | None = Field(default=None, alias="isEnabled")

    @field_validator("keyword", mode="before")
    @classmethod
    def trim_keyword(cls, value: object) -> object:
        """Trims string keywords before applying length constraints."""
        return value.strip() if isinstance(value, str) else value


class CreateUserSkillRequest(ApiModel):
    """Validates creation fields for a private user Skill."""

    name: str = Field(min_length=1, max_length=64)
    description: str | None = Field(default=None, max_length=500)
    instruction: str = Field(min_length=1, max_length=12_000)
    is_enabled: StrictBool = Field(default=True, alias="isEnabled")

    @field_validator("name", "description", "instruction", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        """Trims persisted text before applying contract limits."""
        return value.strip() if isinstance(value, str) else value


class UpdateUserSkillRequest(ApiModel):
    """Validates partial updates for a private user Skill."""

    name: str | None = Field(default=None, min_length=1, max_length=64)
    description: str | None = Field(default=None, max_length=500)
    instruction: str | None = Field(default=None, min_length=1, max_length=12_000)
    is_enabled: StrictBool | None = Field(default=None, alias="isEnabled")

    @field_validator("name", "description", "instruction", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        """Trims provided text before applying contract limits."""
        return value.strip() if isinstance(value, str) else value


class UserSkillItem(ApiModel):
    """Represents the stable user Skill response payload."""

    id: int
    type: Literal["user"] = "user"
    name: str
    description: str
    instruction: str
    is_enabled: bool = Field(alias="isEnabled")
    readonly: Literal[False] = False
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class UserSkillPage(ApiModel):
    """Represents one page of current-user Skills."""

    list: list[UserSkillItem]
    total: int
    page: int
    page_size: int = Field(alias="pageSize")


class SkillInstruction(ApiModel):
    """Carries one ordered instruction into the Agent runtime."""

    key: str
    type: Literal["system", "user"]
    name: str
    instruction: str
