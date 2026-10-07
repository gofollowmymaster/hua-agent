from __future__ import annotations

import re
from dataclasses import dataclass

HEADING_PATTERN = re.compile(r"(?m)^##[ \t]+([^\r\n]+)[ \t]*$")


@dataclass(frozen=True, slots=True)
class ParsedChunk:
    """Represents one immutable heading-delimited document chunk."""

    content: str
    heading: str | None
    is_summary: bool


@dataclass(frozen=True, slots=True)
class ParsedDigitalAvatarDocument:
    """Contains derived summary text and ordered chunks."""

    summary: str
    chunks: list[ParsedChunk]


def parse_digital_avatar_text(text: str) -> ParsedDigitalAvatarDocument:
    """Splits UTF-8 text only at second-level Markdown headings."""
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    matches = list(HEADING_PATTERN.finditer(normalized))
    if not matches:
        content = normalized.strip()
        single_chunks = [ParsedChunk(content, None, False)] if content else []
        return ParsedDigitalAvatarDocument(summary="", chunks=single_chunks)

    chunks: list[ParsedChunk] = []
    preamble = normalized[: matches[0].start()].strip()
    if preamble:
        chunks.append(ParsedChunk(preamble, None, False))

    summary = ""
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(normalized)
        content = normalized[match.start() : end].strip()
        body = normalized[match.end() : end].strip()
        is_summary = index == len(matches) - 1
        if is_summary:
            summary = body
        if content and body:
            chunks.append(
                ParsedChunk(
                    content=content,
                    heading=match.group(1).strip(),
                    is_summary=is_summary,
                )
            )

    return ParsedDigitalAvatarDocument(summary=summary, chunks=chunks)
