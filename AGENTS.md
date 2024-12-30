# AGENTS.md

## Tech Stack

- **Framework**: NestJS + TypeScript
- **ORM**: Prisma (MySQL)
- **Package Manager**: pnpm
- **Cache/Queue**: Redis + BullMQ
- **Linting**: ESLint + Prettier

## Essential Commands

### Environment Loading (IMPORTANT)

Always prefix commands with the correct env loader:

```bash
pnpm env:dev   -- for development
pnpm env:test  -- for test environment
pnpm env:prod  -- for production
```

### Development

```bash
pnpm start:dev          # Run in dev mode (with hot reload)
pnpm build:dev         # Build for dev
pnpm start:debug       # Debug mode
```

### Database (Prisma)

```bash
pnpm pg                # prisma generate - generates Prisma client
pnpm pf                # prisma format
pnpm migrate:dev       # Create migration (dev)
pnpm migrate:test      # Create migration (test)
pnpm migrate:prod      # Apply migrations (prod)
pnpm pmSdo             # Open Prisma Studio
```

### Build & Deploy

```bash
pnpm docker:dev         # Run dev via PM2 in Docker
pnpm docker:test        # Run test via PM2 in Docker
pnpm docker:prod        # Run prod via PM2 in Docker
```

### Code Quality

```bash
pnpm lint              # ESLint --fix
pnpm format            # Prettier write
```

### Testing

```bash
pnpm test              # Unit tests (jest from src/, *.spec.ts)
pnpm test:cov          # With coverage
```

## Environment Files

Environment variables load in this order (later overrides earlier):

- `dev`: `.env` → `.env.dev` → `.env.dev.local`
- `test`: `.env` → `.env.test` → `.env.test.local`
- `prod`: `.env` → `.env.prod` → `.env.prod.local`

## Path Aliases

- `@src/*` → `src/*`
- `@utils/*` → `src/utils/*`
- `@mockServer/*` → `mockServer/*`

## Architecture

### Module Structure

```
src/
├── manage/       # Management features
├── robot/        # Feishu robot integrations
├── ai/           # AI features
├── admin/        # Admin panel
├── doc/          # Documentation
├── alert/        # Alerting system
├── fd-copilot/   # Frontend copilot
├── devops/       # DevOps integrations
├── common/       # Shared: guards, filters, interceptors, middleware, services
│   └── service/  # Global: Redis, Logger, Prisma, TenantContext
├── config/       # Configuration with tenant support (A, yurex, boat)
└── main.ts       # Entry point (port 3000)
```

### Global Services (available everywhere)

- `PrismaService` - Database access via Prisma
- `RedisService` / `RedisProvider` - Redis operations
- `LoggerService` - Winston logging
- `TenantContext` - Multi-tenant support

### API Documentation

- Swagger UI: `/swagger` (only in `NODE_ENV=dev`)
- Swagger JSON: `/swagger/json`

## Prisma

- Schema: `prisma/schema.prisma`
- Database: MySQL
- Binary targets: `native`, `debian-openssl-3.0.x`
- Always run `pnpm pg` after schema changes

## OpenSpec Workflow

This repo uses OpenSpec for change management:

- Changes live in `openspec/changes/`
- Use the skills: `openspec-propose`, `openspec-apply-change`, `openspec-archive-change`
- Run via `/opsx-propose`, `/opsx-apply`, `/opsx-archive`

## Code Style

- **Prettier**: single quotes, trailing commas
- **ESLint**: TypeScript recommended rules (no-explicit-any off)
- **TypeScript**: strictNullChecks off, noImplicitAny off

## Testing Notes

- Only 1 spec file found (`src/alert/common/service/msg-alert.service.spec.ts`)
- Tests use `@nestjs/testing` and `supertest`
- Test pattern: `*.spec.ts` in src directory
