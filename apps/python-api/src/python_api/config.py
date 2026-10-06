from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import (
    AliasChoices,
    Field,
    SecretStr,
    ValidationError,
    field_validator,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict

PYTHON_API_DIR = Path(__file__).resolve().parents[2]
EnvironmentName = Literal["dev", "test", "prod"]


class ConfigurationError(RuntimeError):
    """Reports invalid configuration without including configured values."""

    def __init__(self, fields: list[str]) -> None:
        names = ", ".join(sorted(set(fields)))
        super().__init__(f"Invalid or missing configuration: {names}")
        self.fields = sorted(set(fields))


def normalize_environment(value: str | None) -> EnvironmentName:
    """Normalizes supported environment aliases to a stable file suffix."""
    normalized = (value or "dev").strip().lower()
    normalized = {"development": "dev", "production": "prod"}.get(normalized, normalized)
    if normalized not in {"dev", "test", "prod"}:
        raise ConfigurationError(["PYTHON_API_ENV"])
    return normalized  # type: ignore[return-value]


def selected_environment() -> EnvironmentName:
    """Selects the Python environment without reading another application's files."""
    return normalize_environment(os.getenv("PYTHON_API_ENV") or os.getenv("NODE_ENV"))


def environment_files(
    environment: EnvironmentName, env_dir: Path = PYTHON_API_DIR
) -> tuple[Path, Path, Path]:
    """Returns environment files in increasing precedence order."""
    return (
        env_dir / ".env",
        env_dir / f".env.{environment}",
        env_dir / f".env.{environment}.local",
    )


class Settings(BaseSettings):
    """Validates environment-specific runtime configuration for the Python API."""

    model_config = SettingsConfigDict(
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    python_api_env: EnvironmentName
    python_api_host: str = "0.0.0.0"
    python_api_port: int = Field(default=8000, ge=1, le=65_535)
    python_api_workers: int = Field(default=1, ge=1)
    python_api_reload: bool = False
    python_api_docs_enabled: bool | None = None
    python_api_log_level: Literal["CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG"] = "INFO"

    rag_database_url: str
    database_pool_size: int = Field(default=10, ge=1)
    database_max_overflow: int = Field(default=20, ge=0)
    database_pool_timeout_seconds: float = Field(default=30, gt=0)
    database_pool_recycle_seconds: int = Field(default=1800, ge=0)
    database_pool_pre_ping: bool = True

    redis_host: str = Field(validation_alias=AliasChoices("REDIS_HOST", "DB_REDIS_HOST"))
    redis_port: int = Field(
        ge=1,
        le=65_535,
        validation_alias=AliasChoices("REDIS_PORT", "DB_REDIS_PORT"),
    )
    redis_db: int = Field(ge=0, validation_alias=AliasChoices("REDIS_DB", "DB_REDIS_DB"))
    redis_password: SecretStr | None = Field(
        default=None,
        validation_alias=AliasChoices("REDIS_PASSWORD", "DB_REDIS_PASSWORD"),
    )
    redis_max_connections: int = Field(default=20, ge=1)
    redis_connect_timeout_seconds: float = Field(default=5, gt=0)
    redis_read_timeout_seconds: float = Field(default=5, gt=0)
    redis_health_check_interval_seconds: int = Field(default=30, ge=0)

    jwt_secret: SecretStr
    jwt_token_expired_time: int = Field(default=7, ge=1)
    default_tenant: str = "aplus"

    openai_api_key: SecretStr | None = None
    openai_base_url: str | None = None
    model_name: str = "qwen-plus"
    rag_query_rewrite_model: str = "qwen-turbo"
    rag_reasoning_effort: Literal["none", "minimal", "low", "medium", "high", "xhigh"] = (
        "xhigh"
    )
    embeddings_api_key: SecretStr | None = None
    embeddings_base_url: str | None = None
    embeddings_model_name: str = "text-embedding-v3"
    embeddings_dimensions: int = Field(default=1024, ge=1)
    rerank_api_key: SecretStr | None = None
    rerank_url: str | None = None
    rerank_model: str = "qwen3-rerank"
    rerank_timeout_ms: int = Field(default=10_000, gt=0)
    rag_rerank_mode: Literal["none", "rule", "model"] = "rule"
    rag_vector_top_k: int = Field(default=8, ge=1)
    rag_keyword_top_k: int = Field(default=8, ge=1)
    rag_fusion_k: int = Field(default=60, ge=1)
    rag_rerank_top_n: int = Field(default=30, ge=1)

    raw_dir: str = "raw"
    rag_chunk_size: int = Field(default=800, ge=1)
    rag_chunk_overlap: int = Field(default=120, ge=0)
    rag_embedding_batch_size: int = Field(default=10, ge=1)
    rag_default_top_k: int = Field(default=8, ge=1)
    rag_prompt_version: str = "v1"
    agent_docs_dir: str = "src/agent/docs"
    agent_chunk_size: int = Field(default=800, ge=1)
    agent_chunk_overlap: int = Field(default=120, ge=0)
    agent_embedding_batch_size: int = Field(default=10, ge=1)

    feishu_alert_app_appid: str | None = None
    feishu_alert_app_appsecret: SecretStr | None = None
    feishu_aplus_node_admin_app_token: SecretStr | None = None
    server_alert_groupid: str | None = None
    feishu_smoke_test_enabled: bool = False

    rag_admin_bootstrap_username: str = ""
    rag_admin_bootstrap_password: SecretStr | None = None
    rag_admin_bootstrap_supplier_code: str = "A"
    rag_admin_bootstrap_display_name: str = ""
    rag_admin_bootstrap_reset_password: bool = False

    cors_origins: str = "*"
    cors_allow_credentials: bool = True
    python_api_max_request_size_bytes: int = Field(default=50 * 1024 * 1024, ge=1)
    python_api_max_upload_files: int = Field(default=20, ge=1)
    python_api_max_upload_size_bytes: int = Field(default=50 * 1024 * 1024, ge=1)

    workspace_root: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[4])

    @field_validator("rag_database_url", "redis_host", "default_tenant")
    @classmethod
    def normalize_required_strings(cls, value: str) -> str:
        """Trims and rejects blank core string settings."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("must not be empty")
        return normalized

    @field_validator("rag_admin_bootstrap_username")
    @classmethod
    def strip_bootstrap_username(cls, value: str) -> str:
        """Normalizes the optional bootstrap username."""
        return value.strip()

    @field_validator(
        "redis_password",
        "openai_api_key",
        "embeddings_api_key",
        "rerank_api_key",
        "feishu_alert_app_appsecret",
        "feishu_aplus_node_admin_app_token",
        "rag_admin_bootstrap_password",
        mode="before",
    )
    @classmethod
    def normalize_optional_secrets(cls, value: object) -> object:
        """Treats blank optional secrets as disabled integrations."""
        return None if value == "" else value

    @field_validator("jwt_secret")
    @classmethod
    def reject_empty_jwt_secret(cls, value: SecretStr) -> SecretStr:
        """Prevents runtime HMAC failures by validating JWT configuration at startup."""
        if not value.get_secret_value():
            raise ValueError("must not be empty")
        return value

    @model_validator(mode="after")
    def validate_related_values(self) -> Settings:
        """Validates paired credentials and chunk overlap constraints."""
        password = (
            self.rag_admin_bootstrap_password.get_secret_value()
            if self.rag_admin_bootstrap_password
            else ""
        )
        if bool(self.rag_admin_bootstrap_username) != bool(password):
            raise ValueError(
                "RAG_ADMIN_BOOTSTRAP_USERNAME and RAG_ADMIN_BOOTSTRAP_PASSWORD must be set together"
            )
        if self.rag_chunk_overlap >= self.rag_chunk_size:
            raise ValueError("RAG_CHUNK_OVERLAP must be smaller than RAG_CHUNK_SIZE")
        if self.agent_chunk_overlap >= self.agent_chunk_size:
            raise ValueError("AGENT_CHUNK_OVERLAP must be smaller than AGENT_CHUNK_SIZE")
        return self

    @property
    def node_env(self) -> str:
        """Provides the normalized environment to existing integration metadata."""
        return self.python_api_env

    @property
    def docs_enabled(self) -> bool:
        """Enables API documentation by default outside production."""
        if self.python_api_docs_enabled is not None:
            return self.python_api_docs_enabled
        return self.python_api_env != "prod"

    @property
    def cors_origin_list(self) -> list[str]:
        """Parses comma-separated CORS origins without requiring JSON syntax."""
        origins = [value.strip() for value in self.cors_origins.split(",") if value.strip()]
        return origins or (["*"] if self.python_api_env != "prod" else [])

    @property
    def async_database_url(self) -> str:
        """Returns an asyncpg-compatible URL without changing the shared value."""
        value = self.rag_database_url
        if value.startswith("postgres://"):
            value = "postgresql://" + value.removeprefix("postgres://")
        if value.startswith("postgresql://"):
            value = "postgresql+asyncpg://" + value.removeprefix("postgresql://")
        return value

    @property
    def redis_url(self) -> str:
        """Builds a Redis URL while keeping the password redacted from model output."""
        password = self.redis_password.get_secret_value() if self.redis_password else ""
        auth = f":{password}@" if password else ""
        return f"redis://{auth}{self.redis_host}:{self.redis_port}/{self.redis_db}"

    @property
    def public_dir(self) -> Path:
        """Points at the static assets currently produced for the NestJS app."""
        return self.workspace_root / "apps" / "api" / "public"

    def require_openai_key(self) -> SecretStr:
        """Returns the chat provider key or raises a value-safe configuration error."""
        if not self.openai_api_key or not self.openai_api_key.get_secret_value():
            raise ConfigurationError(["OPENAI_API_KEY"])
        return self.openai_api_key

    def require_embeddings_key(self) -> SecretStr:
        """Returns the embedding key with the compatible OpenAI fallback."""
        key = self.embeddings_api_key or self.openai_api_key
        if not key or not key.get_secret_value():
            raise ConfigurationError(["EMBEDDINGS_API_KEY", "OPENAI_API_KEY"])
        return key

    def require_rerank_key(self) -> SecretStr:
        """Returns the rerank key with embedding and OpenAI fallbacks."""
        key = self.rerank_api_key or self.embeddings_api_key or self.openai_api_key
        if not key or not key.get_secret_value():
            raise ConfigurationError(
                ["RERANK_API_KEY", "EMBEDDINGS_API_KEY", "OPENAI_API_KEY"]
            )
        return key

    def require_feishu_app(self) -> tuple[str, str]:
        """Returns Feishu application credentials only when the integration is invoked."""
        missing = []
        if not self.feishu_alert_app_appid:
            missing.append("FEISHU_ALERT_APP_APPID")
        if not self.feishu_alert_app_appsecret:
            missing.append("FEISHU_ALERT_APP_APPSECRET")
        if missing:
            raise ConfigurationError(missing)
        assert self.feishu_alert_app_appid is not None
        assert self.feishu_alert_app_appsecret is not None
        return self.feishu_alert_app_appid, self.feishu_alert_app_appsecret.get_secret_value()

    def require_feishu_app_token(self) -> str:
        """Returns the Bitable application token only when fixed-token auth is used."""
        if not self.feishu_aplus_node_admin_app_token:
            raise ConfigurationError(["FEISHU_APLUS_NODE_ADMIN_APP_TOKEN"])
        return self.feishu_aplus_node_admin_app_token.get_secret_value()


def load_settings(environment: str | None = None, env_dir: Path = PYTHON_API_DIR) -> Settings:
    """Loads one environment and converts validation errors to value-safe diagnostics."""
    selected = normalize_environment(environment) if environment else selected_environment()
    try:
        return Settings(
            python_api_env=selected,
            _env_file=environment_files(selected, env_dir),
        )
    except ValidationError as error:
        fields = []
        for item in error.errors(include_input=False, include_url=False):
            location = item.get("loc", ())
            if location:
                fields.append(str(location[0]).upper())
                continue
            message = str(item.get("msg", ""))
            if "RAG_ADMIN_BOOTSTRAP" in message:
                fields.extend(
                    ["RAG_ADMIN_BOOTSTRAP_USERNAME", "RAG_ADMIN_BOOTSTRAP_PASSWORD"]
                )
            elif "RAG_CHUNK" in message:
                fields.extend(["RAG_CHUNK_SIZE", "RAG_CHUNK_OVERLAP"])
            elif "AGENT_CHUNK" in message:
                fields.extend(["AGENT_CHUNK_SIZE", "AGENT_CHUNK_OVERLAP"])
            else:
                fields.append("SETTINGS")
        raise ConfigurationError(fields) from None


@lru_cache
def get_settings() -> Settings:
    """Returns the process-wide validated settings instance."""
    return load_settings()
