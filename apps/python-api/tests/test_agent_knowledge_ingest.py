from __future__ import annotations

import hashlib
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest

from python_api.modules.agent.knowledge.service import AgentKnowledgeService


class FakeDatabase:
    """Returns deterministic document lookups and records transaction boundaries."""

    def __init__(self, existing: Any) -> None:
        self.results = [existing, None]
        self.commits = 0

    async def scalar(self, _statement: Any) -> Any:
        """Returns the existing path match followed by no hash duplicate."""
        return self.results.pop(0)

    async def commit(self) -> None:
        """Records a successful ingestion commit."""
        self.commits += 1

    async def rollback(self) -> None:
        """Supports the service failure contract for test doubles."""


class FakeRepository:
    """Captures the document and chunk payload passed to persistence."""

    def __init__(self) -> None:
        self.payload: dict[str, Any] | None = None

    async def replace_document(self, **payload: Any) -> int:
        """Records one replacement and returns a stable identifier."""
        self.payload = payload
        return 1


class FakeEmbeddings:
    """Returns one deterministic vector per cleaned chunk."""

    async def aembed_documents(self, texts: list[str]) -> list[list[float]]:
        """Creates vectors without calling an external provider."""
        return [[0.1, 0.2] for _ in texts]


class RecordingEmbeddings:
    """Records provider batches and returns vectors derived from input order."""

    def __init__(self) -> None:
        self.calls: list[list[str]] = []

    async def aembed_documents(self, texts: list[str]) -> list[list[float]]:
        """Records one batch and returns its numeric chunk identifiers."""
        self.calls.append(texts)
        return [[float(text.removeprefix("chunk-"))] for text in texts]


class FakeSplitter:
    """Keeps the cleaned document as one chunk for assertion clarity."""

    def split_text(self, content: str) -> list[str]:
        """Returns the supplied cleaned content unchanged."""
        return [content]


@pytest.mark.asyncio
async def test_ingest_backfills_original_content_and_keeps_chunks_clean(tmp_path: Path) -> None:
    """Reindexes an unchanged legacy row and persists raw and cleaned text separately."""
    root = tmp_path / "docs"
    document_path = root / "yurex" / "Yurex业务流程" / "guide.md"
    document_path.parent.mkdir(parents=True)
    original = (
        '\ufeff---\n远程文档: "https://example.invalid/doc"\n---\n\n'
        "# 指南\n\n![截图](./image.png)\n\n\n完整正文"
    )
    document_path.write_text(original, encoding="utf-8")
    file_bytes = document_path.read_bytes()
    persisted = file_bytes.decode("utf-8-sig")
    digest = hashlib.sha256(file_bytes).hexdigest()
    existing = SimpleNamespace(
        id=1,
        file_hash=digest,
        status="ready",
        category="业务流程",
        content="",
    )
    database = FakeDatabase(existing)
    repository = FakeRepository()
    service = object.__new__(AgentKnowledgeService)
    service.db = database
    service.repository = repository
    service.tenant = "yurex"
    service.settings = SimpleNamespace(
        agent_docs_dir=str(root),
        workspace_root=tmp_path,
        agent_embedding_batch_size=10,
    )
    service.embeddings = FakeEmbeddings()
    service.splitter = FakeSplitter()

    result = await service.ingest(force=False)

    assert result["indexedFiles"] == 1
    assert result["skippedFiles"] == 0
    assert repository.payload is not None
    assert repository.payload["content"] == persisted
    assert "远程文档" not in repository.payload["chunks"][0]["content"]
    assert "![截图]" not in repository.payload["chunks"][0]["content"]
    assert "完整正文" in repository.payload["chunks"][0]["content"]
    assert database.commits == 1


@pytest.mark.asyncio
async def test_embed_documents_caps_provider_batches_and_preserves_order() -> None:
    """Limits oversized configuration to the provider maximum without reordering vectors."""
    embeddings = RecordingEmbeddings()
    service = object.__new__(AgentKnowledgeService)
    service.settings = SimpleNamespace(agent_embedding_batch_size=16)
    service.embeddings = embeddings
    texts = [f"chunk-{index}" for index in range(23)]

    vectors = await service._embed_documents(texts)

    assert [len(batch) for batch in embeddings.calls] == [10, 10, 3]
    assert all(len(batch) <= 10 for batch in embeddings.calls)
    assert vectors == [[float(index)] for index in range(23)]
