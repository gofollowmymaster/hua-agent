from pydantic import Field

from python_api.core.schemas import ApiModel


class ChatPart(ApiModel):
    """Represents one incoming AI SDK UI message part."""

    type: str
    text: str | None = None


class ChatMessage(ApiModel):
    """Represents one incoming AI SDK UI message."""

    id: str | None = None
    role: str
    parts: list[ChatPart] = Field(default_factory=list)


class ChatRequest(ApiModel):
    """Provides the shared RAG and Agent chat request shape."""

    id: str | None = None
    messages: list[ChatMessage] = Field(default_factory=list)
    participant_id: str | None = Field(default=None, alias="participantId")


