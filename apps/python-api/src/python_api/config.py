from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralizes environment parsing shared with the NestJS deployment."""

    model_config = SettingsConfigDict(
        env_file=(".env.dev.local", ".env.dev", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    node_env: str = "dev"
    python_api_host: str = "0.0.0.0"
    python_api_port: int = 8000
    python_api_workers: int = 1

    rag_database_url: str = "postgres://user:123456@localhost:5432/vc_rag"
    db_redis_host: str = "127.0.0.1"
    db_redis_port: int = 6379
    db_redis_db: int = 0
    db_redis_password: str = ""

    jwt_secret: str = ""
    jwt_token_expired_time: int = 7
    default_tenant: str = "aplus"

    openai_api_key: str = ""
    openai_base_url: str | None = None
    model_name: str = "qwen-plus"
    rag_query_rewrite_model: str = "qwen-turbo"
    rag_reasoning_effort: str = "xhigh"
    embeddings_api_key: str = ""
    embeddings_base_url: str | None = None
    embeddings_model_name: str = "text-embedding-v3"
    embeddings_dimensions: int = 1024
    rerank_api_key: str = ""
    rerank_url: str | None = None
    rerank_model: str = "qwen3-rerank"
    rerank_timeout_ms: int = 10_000
    rag_rerank_mode: str = "rule"
    rag_vector_top_k: int = 8
    rag_keyword_top_k: int = 8
    rag_fusion_k: int = 60
    rag_rerank_top_n: int = 30

    raw_dir: str = "raw"
    rag_chunk_size: int = 800
    rag_chunk_overlap: int = 120
    rag_embedding_batch_size: int = 10
    rag_default_top_k: int = 8
    rag_prompt_version: str = "v1"
    agent_docs_dir: str = "src/agent/docs"
    agent_chunk_size: int = 800
    agent_chunk_overlap: int = 120
    agent_embedding_batch_size: int = 10

    feishu_alert_app_appid: str = ""
    feishu_alert_app_appsecret: str = ""
    feishu_aplus_node_admin_app_token: str = ""
    server_alert_groupid: str = ""
    feishu_smoke_test_enabled: bool = False

    rag_admin_bootstrap_username: str = ""
    rag_admin_bootstrap_password: str = ""
    rag_admin_bootstrap_supplier_code: str = "A"
    rag_admin_bootstrap_display_name: str = ""
    rag_admin_bootstrap_reset_password: bool = False

    workspace_root: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[4])

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
        """Builds the Redis URL from the same discrete settings as NestJS."""
        auth = f":{self.db_redis_password}@" if self.db_redis_password else ""
        return f"redis://{auth}{self.db_redis_host}:{self.db_redis_port}/{self.db_redis_db}"

    @property
    def public_dir(self) -> Path:
        """Points at the static assets currently produced for the NestJS app."""
        return self.workspace_root / "apps" / "api" / "public"


@lru_cache
def get_settings() -> Settings:
    """Returns the process-wide immutable settings instance."""
    return Settings()
