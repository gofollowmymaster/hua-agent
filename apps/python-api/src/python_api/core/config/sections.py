from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from pydantic import SecretStr


@dataclass(frozen=True, slots=True)
class AppConfig:
    """Groups HTTP process, documentation, logging, and CORS settings."""

    environment: str
    host: str
    port: int
    workers: int
    reload: bool
    docs_enabled: bool
    log_level: str
    cors_origins: list[str]
    cors_allow_credentials: bool
    max_request_size_bytes: int


@dataclass(frozen=True, slots=True)
class DatabaseConfig:
    """Groups the PostgreSQL URL and pool tuning settings."""

    url: str
    pool_size: int
    max_overflow: int
    pool_timeout_seconds: float
    pool_recycle_seconds: int
    pool_pre_ping: bool


@dataclass(frozen=True, slots=True)
class RedisConfig:
    """Groups Redis connectivity and timeout settings."""

    host: str
    port: int
    db: int
    password: SecretStr | None
    max_connections: int
    connect_timeout_seconds: float
    read_timeout_seconds: float
    health_check_interval_seconds: int


@dataclass(frozen=True, slots=True)
class AuthConfig:
    """Groups JWT, default tenant, and bootstrap identity settings."""

    jwt_secret: SecretStr
    token_expired_days: int
    default_tenant: str
    bootstrap_username: str
    bootstrap_password: SecretStr | None
    bootstrap_supplier_code: str
    bootstrap_display_name: str
    bootstrap_reset_password: bool


@dataclass(frozen=True, slots=True)
class AIConfig:
    """Groups chat, embedding, rerank, RAG, and Agent model settings."""

    openai_api_key: SecretStr | None
    openai_base_url: str | None
    model_name: str
    embeddings_api_key: SecretStr | None
    embeddings_base_url: str | None
    embeddings_model_name: str
    embeddings_dimensions: int
    rerank_api_key: SecretStr | None
    rerank_url: str | None
    rerank_model: str


@dataclass(frozen=True, slots=True)
class FilesConfig:
    """Groups workspace paths, chunking, upload, and document limits."""

    workspace_root: Path
    raw_dir: str
    agent_docs_dir: str
    max_upload_files: int
    max_upload_size_bytes: int
