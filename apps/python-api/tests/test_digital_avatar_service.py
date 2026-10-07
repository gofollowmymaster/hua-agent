from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Any, cast
from unittest.mock import AsyncMock

import pytest
from fastapi import UploadFile
from httpx import AsyncClient
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.config import get_settings
from python_api.modules.digital_avatar.models import DigitalAvatarDocument
from python_api.modules.digital_avatar.repository import DigitalAvatarSource
from python_api.modules.digital_avatar.service import DigitalAvatarDocumentService


def create_service(tmp_path: Any) -> tuple[DigitalAvatarDocumentService, AsyncMock]:
    """Builds a service with isolated files and a mocked database session."""
    db = AsyncMock()
    db.scalar.return_value = None
    settings = get_settings().model_copy(
        update={
            "workspace_root": tmp_path,
            "raw_dir": "raw",
            "embeddings_api_key": SecretStr("test-embedding-key"),
        }
    )
    return DigitalAvatarDocumentService(cast(AsyncSession, db), settings), db


@pytest.mark.asyncio
async def test_upload_accepts_txt_and_keeps_per_file_failures(
    tmp_path: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    service, _db = create_service(tmp_path)
    process = AsyncMock(
        return_value={
            "fileName": "valid.txt",
            "sourcePath": "valid.txt",
            "status": "indexed",
            "documentId": "1",
            "chunks": 2,
        }
    )
    monkeypatch.setattr(service, "_process_source", process)

    result = await service.upload(
        [
            UploadFile(filename="valid.txt", file=BytesIO("## 正文\n内容".encode())),
            UploadFile(filename="invalid.md", file=BytesIO(b"content")),
        ]
    )

    assert result["totalFiles"] == 2
    assert result["indexedFiles"] == 1
    assert result["failedFiles"] == 1
    assert result["chunks"] == 2
    process.assert_awaited_once()


@pytest.mark.asyncio
async def test_upload_reuses_source_path_when_file_name_content_changes(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    service, _db = create_service(tmp_path)
    service.root.mkdir(parents=True)
    managed = service.root / "same.txt"
    managed.write_text("old content", encoding="utf-8")
    process = AsyncMock(
        return_value={
            "fileName": "same.txt",
            "sourcePath": "same.txt",
            "status": "indexed",
            "documentId": "1",
            "chunks": 1,
        }
    )
    monkeypatch.setattr(service, "_process_source", process)

    result = await service.upload([UploadFile(filename="same.txt", file=BytesIO(b"new content"))])

    assert result["indexedFiles"] == 1
    assert managed.read_text(encoding="utf-8") == "new content"
    assert process.await_args.args[0].source_path == "same.txt"


@pytest.mark.asyncio
async def test_ingest_sends_derived_summary_and_fixed_chunks(
    tmp_path: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    service, _db = create_service(tmp_path)
    source_path = tmp_path / "source.txt"
    source_path.write_text("前言\n## 正文\n内容\n## 结语\n最终摘要", encoding="utf-8")
    source = DigitalAvatarSource(source_path, "source.txt", "source.txt", "hash", 10)
    embed = AsyncMock(return_value=[[0.0], [0.0], [0.0]])
    replace = AsyncMock(return_value=7)
    monkeypatch.setattr(service, "_embed", embed)
    monkeypatch.setattr(service.repository, "replace_document", replace)

    document_id, count = await service._ingest_source(source, force=True)

    assert (document_id, count) == (7, 3)
    assert replace.await_args.args[1] == "最终摘要"
    assert [item["content"] for item in replace.await_args.args[2]] == [
        "前言",
        "## 正文\n内容",
        "## 结语\n最终摘要",
    ]


@pytest.mark.asyncio
async def test_manual_summary_can_be_empty(tmp_path: Any) -> None:
    service, db = create_service(tmp_path)
    document = DigitalAvatarDocument(
        id=1,
        source_path="source.txt",
        file_name="source.txt",
        file_type="txt",
        file_hash="hash",
        file_size=10,
        summary="old",
        chunk_count=1,
        status="ready",
    )
    db.get.return_value = document
    db.scalar.return_value = 1

    result = await service.update_summary(1, "   ")

    assert document.summary == ""
    assert result["summary"] == ""
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_digital_avatar_routes_require_bearer(client: AsyncClient) -> None:
    response = await client.post("/digital-avatar/admin/documents/page", json={})

    assert response.json()["code"] == 401


@pytest.mark.asyncio
async def test_import_duplicate_does_not_overwrite_managed_file(tmp_path: Path) -> None:
    service, db = create_service(tmp_path)
    source_root = tmp_path / "source"
    source_root.mkdir()
    source = source_root / "duplicate.txt"
    source.write_text("same content", encoding="utf-8")
    service.root.mkdir(parents=True)
    managed = service.root / source.name
    managed.write_text("existing managed content", encoding="utf-8")
    duplicate = DigitalAvatarDocument(
        id=9,
        source_path="other.txt",
        file_name="other.txt",
        file_type="txt",
        file_hash="a636bd7cd42060a4d07fa1bfbcc010eb7794c2ba721e1e3e4c20335a15b66eaf",
        file_size=12,
        summary="",
        chunk_count=1,
        status="ready",
    )
    db.scalar.side_effect = [None, duplicate]

    result = await service.import_directory(source_root)

    assert result["duplicateFiles"] == 1
    assert managed.read_text(encoding="utf-8") == "existing managed content"
