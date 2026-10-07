from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

from sqlalchemy.ext.asyncio import async_sessionmaker

from python_api.core.config import get_settings
from python_api.core.database import create_database_engine
from python_api.modules.digital_avatar.service import DigitalAvatarDocumentService


def parse_args() -> argparse.Namespace:
    """Parses the source directory supplied to the batch importer."""
    parser = argparse.ArgumentParser(description="Import digital avatar txt documents")
    parser.add_argument(
        "--source",
        type=Path,
        default=Path("data/管理知识文档"),
        help="Directory recursively containing UTF-8 txt files",
    )
    return parser.parse_args()


async def run(source: Path) -> dict[str, object]:
    """Imports one directory using the selected Python API environment."""
    settings = get_settings()
    engine = create_database_engine(settings)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    try:
        async with session_factory() as session:
            return await DigitalAvatarDocumentService(session, settings).import_directory(source)
    finally:
        await engine.dispose()


def main() -> None:
    """Runs the importer and prints a machine-readable result summary."""
    result = asyncio.run(run(parse_args().source))
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
