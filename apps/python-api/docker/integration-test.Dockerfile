FROM ghcr.io/astral-sh/uv:0.8.22-python3.12-bookworm-slim

WORKDIR /workspace

COPY apps/python-api/pyproject.toml apps/python-api/uv.lock /workspace/apps/python-api/
RUN uv sync --project apps/python-api --frozen

COPY apps/python-api /workspace/apps/python-api

ENV PYTHON_API_ENV=test \
    PYTHON_API_INTEGRATION=1 \
    RAG_DATABASE_URL=postgresql://test_user:test_password@postgres:5432/aplus_python_test \
    REDIS_HOST=redis \
    REDIS_PORT=6379 \
    REDIS_DB=0 \
    JWT_SECRET=python-api-integration-secret

CMD ["uv", "run", "--project", "apps/python-api", "pytest", "-m", "integration", "apps/python-api/tests/integration"]
