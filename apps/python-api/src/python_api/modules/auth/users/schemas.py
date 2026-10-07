from pydantic import Field

from python_api.core.schemas import ApiModel, PageRequest


class CreateUserRequest(ApiModel):
    """Validates creation of a tenant-local user."""

    username: str = Field(min_length=1, max_length=64)
    display_name: str = Field(alias="displayName", min_length=1, max_length=64)
    password: str = Field(min_length=8, max_length=128)


class UpdateUserRequest(ApiModel):
    """Validates mutable local user fields."""

    display_name: str | None = Field(default=None, alias="displayName", min_length=1, max_length=64)
    is_enabled: bool | None = Field(default=None, alias="isEnabled")


class ResetPasswordRequest(ApiModel):
    """Validates administrator password resets."""

    password: str = Field(min_length=8, max_length=128)


class QueryUsersRequest(PageRequest):
    """Validates tenant user pagination and search."""

    keyword: str | None = Field(default=None, max_length=64)
