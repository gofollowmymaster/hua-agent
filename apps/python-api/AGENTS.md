# AGENTS.md

## Scope

These rules apply to `apps/python-api/**`. The app is a Python 3.12 FastAPI parity
implementation of `apps/api`; both services remain deployable and share the Prisma-owned
PostgreSQL schema and `frontend-node:*` Redis keys.

## Commands

Run from the repository root:

```bash
pnpm python-api:sync
pnpm python-api:dev
pnpm python-api:test
pnpm python-api:lint
pnpm python-api:typecheck
pnpm python-api:build
```

## Boundaries

- Prisma schema and SQL migrations in `apps/api` are the only database authority. Do not add Alembic.
- Preserve route, authentication, tenant, response, error, file, and AI SDK stream contracts.
- Every database read/write must include the current tenant unless the table is explicitly global.
- Redis keys, TTL values, JSON encoding, and idempotency states must stay compatible with NestJS.
- Normalize LangChain, LangGraph, and Deep Agents events before producing UI Message SSE events.
- Do not log credentials, request bodies, knowledge contents, raw tool arguments, or full tool results.
- Feishu integration tests use mocks by default; live smoke tests require `FEISHU_SMOKE_TEST_ENABLED=true`.

## Documentation

- Architecture: `apps/python-api/docs/architecture/README.md`
- Development and verification: `apps/python-api/docs/standard/README.md`
- Cross-app governance: `docs/ai-governance/README.md`
