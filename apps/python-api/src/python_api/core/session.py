from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class ResolvedSession:
    """Carries stable identifiers shared by chat memory and persistence layers."""

    tenant_code: str
    channel: str
    session_key: str
    conversation_id: str | None
    conversation_type: str | None
    participant_id: str | None
    message_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
