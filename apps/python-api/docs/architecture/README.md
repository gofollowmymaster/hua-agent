# Python API Architecture

`apps/python-api` is an independently deployed FastAPI implementation of the NestJS boundary in
`apps/api`. It listens on port 8000 by default; NestJS remains on port 3000. A request is handled by
exactly one backend, while both backends can alternate across requests.

## Layers

- `routes/`: HTTP methods, paths, dependencies, and response type selection.
- `schemas/`: Pydantic request conversion and validation.
- `services/`: use-case orchestration, persistence, document processing, RAG, and Agent behavior.
- `models.py` and `database.py`: async SQLAlchemy mappings and sessions over Prisma-owned tables.
- `feishu.py` and `redis_service.py`: external integrations using shared configuration and formats.
- `middleware.py`, `security.py`, and `ui_stream.py`: boundary compatibility for tenants, auth,
  envelopes, errors, and AI SDK v6 SSE.

Prisma remains the only schema and migration authority. SQLAlchemy models are compatibility
mappings, while pgvector and zhparser operations use parameterized native SQL.

## Shared State

JWT claims and Node-compatible scrypt hashes are accepted across both stacks. Request tenant state
is held in `contextvars`. PostgreSQL queries carry `tenant_code`, and Redis keys preserve the
`frontend-node:*` templates and TTLs. Agent and RAG session rows can therefore be read by either
backend.

## Streaming

Framework-native AI events never leave the service. They are normalized to reasoning, tool start,
tool result, text, and completion events, then encoded as AI SDK UI Message SSE with `[DONE]`.
Visible event order is also stored in the assistant message `parts` column.

## Skill Boundary

Business Agent Skill management and dynamic Skill loading are currently NestJS-only. FastAPI does
not expose `/agent/skills/*`, does not map `agent_user_skills`, and keeps its existing fixed Agent
prompt. This is an intentional compatibility exception until Skill parity is scheduled separately.
