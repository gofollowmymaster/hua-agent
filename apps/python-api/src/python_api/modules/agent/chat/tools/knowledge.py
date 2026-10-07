from __future__ import annotations

from typing import Annotated

from langchain_core.tools import BaseTool, tool
from pydantic import Field

from python_api.modules.agent.chat.tools.utilities import JsonSerializer
from python_api.modules.agent.knowledge.schemas import AgentKnowledgeSearchRequest
from python_api.modules.agent.knowledge.service import AgentKnowledgeService


def build_knowledge_tools(
    knowledge: AgentKnowledgeService, serialize: JsonSerializer
) -> list[BaseTool]:
    """Builds tenant-scoped business knowledge tools."""

    @tool
    async def search_knowledge(
        query: str,
        category: Annotated[
            str | None,
            Field(
                description=(
                    "Optional exact known business category. Omit it when uncertain; "
                    "never pass blanks, null strings, or guessed values."
                )
            ),
        ] = None,
        top_k: int = 8,
    ) -> str:
        """Search tenant knowledge. Only pass an exact known category; otherwise omit it."""
        resolved_category = await knowledge.resolve_search_category_for_tool(category)
        hits = await knowledge.search(
            AgentKnowledgeSearchRequest(query=query, category=resolved_category, topK=top_k)
        )
        visible = [
            {
                **{
                    key: hit.get(key)
                    for key in (
                        "documentId",
                        "category",
                        "fileName",
                        "sourcePath",
                        "remoteUrl",
                        "breadcrumb",
                        "score",
                    )
                },
                "content": str(hit.get("content", ""))[:1200],
            }
            for hit in hits
        ]
        return serialize(visible)

    @tool
    async def get_document(document_id: int | str) -> str:
        """Get one tenant knowledge document with its complete original content."""
        document = await knowledge.get_document_for_tool(int(document_id))
        keys = (
            "id",
            "category",
            "fileName",
            "sourcePath",
            "status",
            "chunkCount",
            "actualChunkCount",
            "breadcrumb",
            "remoteUrl",
            "updatedAt",
            "content",
        )
        return serialize({key: document.get(key) for key in keys})

    return [search_knowledge, get_document]
