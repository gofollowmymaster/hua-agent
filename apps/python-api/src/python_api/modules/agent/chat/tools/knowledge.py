from __future__ import annotations

from langchain_core.tools import BaseTool, tool

from python_api.modules.agent.chat.tools.utilities import JsonSerializer
from python_api.modules.agent.knowledge.schemas import AgentKnowledgeSearchRequest
from python_api.modules.agent.knowledge.service import AgentKnowledgeService


def build_knowledge_tools(
    knowledge: AgentKnowledgeService, serialize: JsonSerializer
) -> list[BaseTool]:
    """Builds tenant-scoped business knowledge tools."""

    @tool
    async def search_knowledge(
        query: str, category: str | None = None, top_k: int = 8
    ) -> str:
        """Search the tenant business knowledge base."""
        hits = await knowledge.search(
            AgentKnowledgeSearchRequest(query=query, category=category, topK=top_k)
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
        """Get one tenant knowledge document."""
        document = await knowledge.get_document(int(document_id))
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
        )
        return serialize({key: document.get(key) for key in keys})

    return [search_knowledge, get_document]
