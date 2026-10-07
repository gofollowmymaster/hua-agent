from pydantic import Field

from python_api.core.schemas import ApiModel, PageRequest


class ChatPart(ApiModel):
    """Represents one incoming Agent UI message part."""

    type: str
    text: str | None = None


class ChatMessage(ApiModel):
    """Represents one incoming Agent UI message."""

    id: str | None = None
    role: str
    parts: list[ChatPart] = Field(default_factory=list)


class ChatRequest(ApiModel):
    """Provides the Agent chat request shape."""

    id: str | None = None
    messages: list[ChatMessage] = Field(default_factory=list)
    participant_id: str | None = Field(default=None, alias="participantId")


class AgentSessionPageRequest(PageRequest):
    """Filters persisted Agent sessions."""

    channel: str | None = None
    conversation_type: str | None = Field(default=None, alias="conversationType")
    user_id: str | None = Field(default=None, alias="userId")
    keyword: str | None = None
