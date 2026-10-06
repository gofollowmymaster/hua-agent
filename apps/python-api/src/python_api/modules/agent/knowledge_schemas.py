from typing import Literal

from pydantic import Field

from python_api.core.schemas import ApiModel, PageRequest


class AgentKnowledgeIngestRequest(ApiModel):
    """Selects whether unchanged Agent documents are rebuilt."""

    force: bool = False


class AgentKnowledgeSearchRequest(ApiModel):
    """Validates Agent knowledge retrieval options."""

    query: str = Field(min_length=1, max_length=500)
    mode: Literal["fulltext", "vector", "hybrid"] = "hybrid"
    category: str | None = None
    top_k: int = Field(default=8, alias="topK", ge=1, le=100)


class AgentDocumentPageRequest(PageRequest):
    """Filters tenant Agent documents."""

    keyword: str | None = None
    category: str | None = None
    status: str | None = None
