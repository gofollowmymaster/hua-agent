from datetime import datetime

from pydantic import Field

from python_api.core.schemas import ApiModel, PageRequest


class DigitalAvatarDocumentPageRequest(PageRequest):
    """Filters globally shared digital avatar documents."""

    keyword: str | None = None
    status: str | None = None
    updated_from: datetime | None = Field(default=None, alias="updatedFrom")
    updated_to: datetime | None = Field(default=None, alias="updatedTo")


class DigitalAvatarSummaryRequest(ApiModel):
    """Carries an administrator-maintained Markdown summary."""

    summary: str = ""
