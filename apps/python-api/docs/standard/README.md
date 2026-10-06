# Python API Development And Verification

## Development Rules

- Use Python 3.12 and uv with the committed `uv.lock`.
- Keep routers thin and put business behavior in services.
- Read environment values only through `config.Settings`.
- Use async database, Redis, model, and Feishu clients in request paths.
- Add concise docstrings to new classes and class methods.
- Do not add schema migrations or duplicate Prisma schema ownership.
- A new or changed NestJS endpoint requires the Python route manifest and differential fixtures to
  be updated in the same change.

## Required Checks

```bash
pnpm python-api:lint
pnpm python-api:typecheck
pnpm python-api:test
pnpm python-api:build
```

Database/Redis integration tests require isolated services with pgvector and zhparser. Live model
and Feishu smoke tests are opt-in; deterministic unit and contract tests must use mocks. For parity
acceptance, run both services against isolated shared state and compare status, headers, bodies,
files, SSE sequences, and database/Redis side effects.
