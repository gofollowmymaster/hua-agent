from pathlib import Path

import pytest

from python_api.config import (
    ConfigurationError,
    load_settings,
    normalize_environment,
    selected_environment,
)
from python_api.core.database import create_database_engine
from python_api.core.redis.redis_service import create_redis_client

CORE = """\
RAG_DATABASE_URL=postgresql://user:password@localhost:5432/database
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
JWT_SECRET=test-secret
"""


def write_environment(path: Path, content: str) -> None:
    """Writes an isolated dotenv fixture without touching repository configuration."""
    path.write_text(content, encoding="utf-8")


def clear_core_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    """Removes process overrides so dotenv precedence can be asserted."""
    for name in (
        "RAG_DATABASE_URL",
        "REDIS_HOST",
        "REDIS_PORT",
        "REDIS_DB",
        "REDIS_PASSWORD",
        "DB_REDIS_HOST",
        "DB_REDIS_PORT",
        "DB_REDIS_DB",
        "DB_REDIS_PASSWORD",
        "JWT_SECRET",
    ):
        monkeypatch.delenv(name, raising=False)


def test_environment_aliases_are_normalized() -> None:
    assert normalize_environment("development") == "dev"
    assert normalize_environment("production") == "prod"
    assert normalize_environment("test") == "test"


def test_python_environment_selector_precedes_node_environment(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("NODE_ENV", "production")
    monkeypatch.setenv("PYTHON_API_ENV", "test")
    assert selected_environment() == "test"

    monkeypatch.delenv("PYTHON_API_ENV")
    assert selected_environment() == "prod"


def test_environment_files_and_process_values_follow_precedence(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    clear_core_environment(monkeypatch)
    write_environment(tmp_path / ".env", CORE + "DEFAULT_TENANT=base\n")
    write_environment(tmp_path / ".env.dev", "DEFAULT_TENANT=environment\nREDIS_DB=1\n")
    write_environment(tmp_path / ".env.dev.local", "DEFAULT_TENANT=local\nREDIS_DB=2\n")

    settings = load_settings("dev", tmp_path)
    assert settings.default_tenant == "local"
    assert settings.redis_db == 2

    monkeypatch.setenv("DEFAULT_TENANT", "process")
    monkeypatch.setenv("REDIS_DB", "3")
    overridden = load_settings("dev", tmp_path)
    assert overridden.default_tenant == "process"
    assert overridden.redis_db == 3


def test_core_configuration_fails_without_exposing_values(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    clear_core_environment(monkeypatch)
    write_environment(tmp_path / ".env.dev", "RAG_DATABASE_URL=secret-database-url\n")

    with pytest.raises(ConfigurationError) as captured:
        load_settings("dev", tmp_path)

    message = str(captured.value)
    assert "REDIS_HOST" in message
    assert "JWT_SECRET" in message
    assert "secret-database-url" not in message


def test_optional_integrations_validate_only_when_requested(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    clear_core_environment(monkeypatch)
    write_environment(tmp_path / ".env.test", CORE)
    settings = load_settings("test", tmp_path)

    with pytest.raises(ConfigurationError, match="OPENAI_API_KEY"):
        settings.require_openai_key()
    with pytest.raises(ConfigurationError, match="FEISHU_ALERT_APP_APPID"):
        settings.require_feishu_app()


def test_secret_values_are_redacted(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    clear_core_environment(monkeypatch)
    write_environment(
        tmp_path / ".env.test",
        CORE + "OPENAI_API_KEY=provider-secret\nREDIS_PASSWORD=redis-secret\n",
    )

    rendered = repr(load_settings("test", tmp_path))
    assert "provider-secret" not in rendered
    assert "redis-secret" not in rendered
    assert "**********" in rendered


def test_legacy_redis_aliases_remain_compatible(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    clear_core_environment(monkeypatch)
    write_environment(
        tmp_path / ".env.test",
        """\
RAG_DATABASE_URL=postgresql://user:password@localhost:5432/database
DB_REDIS_HOST=legacy-host
DB_REDIS_PORT=6380
DB_REDIS_DB=4
DB_REDIS_PASSWORD=legacy-password
JWT_SECRET=test-secret
""",
    )

    settings = load_settings("test", tmp_path)
    assert settings.redis_host == "legacy-host"
    assert settings.redis_port == 6380
    assert settings.redis_db == 4
    assert settings.redis_password is not None
    assert settings.redis_password.get_secret_value() == "legacy-password"


def test_canonical_redis_values_override_legacy_aliases(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    clear_core_environment(monkeypatch)
    write_environment(
        tmp_path / ".env.test",
        CORE + "DB_REDIS_HOST=legacy-host\nREDIS_HOST=canonical-host\n",
    )

    assert load_settings("test", tmp_path).redis_host == "canonical-host"


def test_database_and_redis_factories_apply_runtime_settings(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    clear_core_environment(monkeypatch)
    write_environment(
        tmp_path / ".env.test",
        CORE
        + "DATABASE_POOL_SIZE=3\nDATABASE_MAX_OVERFLOW=7\n"
        + "REDIS_MAX_CONNECTIONS=11\nREDIS_CONNECT_TIMEOUT_SECONDS=2\n"
        + "REDIS_READ_TIMEOUT_SECONDS=4\nREDIS_HEALTH_CHECK_INTERVAL_SECONDS=9\n",
    )
    settings = load_settings("test", tmp_path)

    engine = create_database_engine(settings)
    assert engine.pool.size() == 3  # type: ignore[attr-defined]
    assert engine.pool._max_overflow == 7  # type: ignore[attr-defined]

    client = create_redis_client(settings)
    kwargs = client.connection_pool.connection_kwargs
    assert client.connection_pool.max_connections == 11
    assert kwargs["socket_connect_timeout"] == 2
    assert kwargs["socket_timeout"] == 4
    assert kwargs["health_check_interval"] == 9


def test_python_environment_files_never_reference_nestjs_directory() -> None:
    from python_api.config import PYTHON_API_DIR, environment_files

    files = environment_files("dev")
    assert all(path.parent == PYTHON_API_DIR for path in files)
    assert all(path.parent.name == "python-api" for path in files)
