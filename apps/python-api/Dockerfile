FROM ghcr.io/astral-sh/uv:0.9.24 AS uv

FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHON_API_ENV=prod \
    WORKSPACE_ROOT=/workspace \
    PATH=/app/.venv/bin:$PATH

WORKDIR /app
COPY --from=uv /uv /uvx /bin/
COPY apps/python-api/pyproject.toml apps/python-api/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY apps/python-api/src ./src
COPY apps/api/public /workspace/apps/api/public
RUN uv sync --frozen --no-dev

EXPOSE 8000
CMD ["uv", "run", "--no-sync", "python", "-m", "python_api.run"]
