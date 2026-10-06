from datetime import datetime

from pydantic import Field

from python_api.schemas.common import ApiModel, PageRequest


class DocumentPageRequest(PageRequest):
    """Filters RAG documents by metadata and update time."""

    keyword: str | None = None
    status: str | None = None
    updated_from: datetime | None = Field(default=None, alias="updatedFrom")
    updated_to: datetime | None = Field(default=None, alias="updatedTo")


class DocumentMetadataRequest(ApiModel):
    """Contains administrator-maintained document metadata."""

    type: str | None = None
    tag: str | None = None


class IngestRequest(ApiModel):
    """Selects whether unchanged documents are rebuilt."""

    force: bool = False


class SessionPageRequest(PageRequest):
    """Filters RAG sessions and their message contents."""

    channel: str | None = None
    conversation_id: str | None = Field(default=None, alias="conversationId")
    conversation_type: str | None = Field(default=None, alias="conversationType")
    user_id: str | None = Field(default=None, alias="userId")
    keyword: str | None = None
    active_from: datetime | None = Field(default=None, alias="activeFrom")
    active_to: datetime | None = Field(default=None, alias="activeTo")
