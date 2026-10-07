from __future__ import annotations

from typing import Any, cast

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.modules.agent.repository import AgentRepository


class EmptyMappingsResult:
    """Provides an empty SQLAlchemy mapping result for repository query tests."""

    def mappings(self) -> EmptyMappingsResult:
        """Returns the mapping facade used by the repository."""
        return self

    def all(self) -> list[Any]:
        """Returns no rows so tests can focus on generated SQL and parameters."""
        return []


class RecordingSession:
    """Captures the latest SQL statement and bound parameters."""

    def __init__(self) -> None:
        self.statement = ""
        self.parameters: dict[str, Any] = {}

    async def execute(self, statement: Any, parameters: dict[str, Any]) -> EmptyMappingsResult:
        """Records one repository execution without accessing PostgreSQL."""
        self.statement = str(statement)
        self.parameters = parameters
        return EmptyMappingsResult()


@pytest.mark.asyncio
async def test_document_keyword_paging_searches_original_content_without_chunks() -> None:
    """Uses document content for management filtering while preserving all filters."""
    session = RecordingSession()
    repository = AgentRepository(cast(AsyncSession, session))

    ids, total = await repository.page_document_ids_by_keyword(
        "报销流程", "yurex", "业务流程", "ready", 20, 40
    )

    assert ids == []
    assert total == 0
    assert "to_tsvector('zhparser',d.content)" in session.statement
    assert "agent_chunks" not in session.statement
    assert "d.tenant_code=:tenant" in session.statement
    assert "d.category=:category" in session.statement
    assert "d.status=:status" in session.statement
    assert "strpos(d.file_name,:keyword)" in session.statement
    assert "strpos(d.source_path,:keyword)" in session.statement
    assert "strpos(COALESCE(d.breadcrumb,''),:keyword)" in session.statement
    assert "keyword_query.query IS NOT NULL" in session.statement
    assert "ORDER BY updated_at DESC,id DESC" in session.statement
    assert session.parameters == {
        "keyword": "报销流程",
        "tenant": "yurex",
        "category": "业务流程",
        "status": "ready",
        "limit": 20,
        "offset": 40,
    }


@pytest.mark.asyncio
async def test_agent_fulltext_search_keeps_chunk_level_query() -> None:
    """Keeps Business Agent search on chunk content and its existing index path."""
    session = RecordingSession()
    repository = AgentRepository(cast(AsyncSession, session))

    await repository.search_fulltext_chunks("报销", "yurex", None, 8)

    assert "FROM agent_chunks c" in session.statement
    assert "to_tsvector('zhparser', c.content)" in session.statement
