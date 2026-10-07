from pydantic import Field

from python_api.core.schemas import ApiModel


class LoginRequest(ApiModel):
    """Validates local username and password login."""

    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=8, max_length=128)
