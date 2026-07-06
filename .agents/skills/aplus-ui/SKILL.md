---
name: aplus-ui
description: Use when the user's task involves @aplus-frontend/ui — writing aplus-ui components, debugging issues, querying APIs/props/tokens/demos/changelogs, diagnosing setup, analyzing usage, or scanning deprecated components. Triggers on '@aplus-frontend/ui' imports or explicit aplus-ui questions.

allowed-tools:
  - Bash(aplus *)
  - Bash(which aplus)
---

# Aplus UI CLI

You have access to `@aplus-frontend/cli` — a local CLI with bundled aplus-ui metadata. Use it to query component info, analyze projects, and detect deprecated usage. Component data is offline; only `doctor` needs network (for npm latest version).

## Setup

When loading this skill, install or update the CLI to the latest version before use:

```bash
npm i -g @aplus-frontend/cli@latest
```

**Important:** Run this command when first loading the skill to ensure you have the latest version. This ensures access to the latest component metadata and features. If you encounter issues or stale data, run it again to update.

**Always use `--format json` for structured output.**

## Scenarios

Please note: The following scenarios all use the `AgGrid` component as an example.

### 1. Writing aplus-ui component code

Before writing code, query API first — do not rely on memory.

```bash
# List all available components
aplus list --format json

# Check available props
aplus info AgGrid --format json

# Based on demoTitleList, fetch the best matching demo as a starting point
aplus demo AgGrid theBestMatchDemoName --format json

# Check component-level design tokens
aplus token AgGrid --format json
```

When reading `aplus info <Component> --format json`, explicitly inspect:

- `props`: main component props
- `typeDefs`: extra type definitions (non-Props API sections)
- `subComponents`: sub-component APIs (each item has its own `props` and `typeDefs`)
- `demoTitleList`: available demo names for selecting examples

**Workflow:** `aplus info` → understand props → `aplus demo` → reuse working example → write code.

### 2. Looking up full documentation

When you need full docs (especially type definitions, not just props):

```bash
aplus doc AgGrid        # full markdown docs for AgGrid
```

Use `aplus doc` when `typeDefs`/`subComponents` in `info` are not enough and you need full API context.

### 3. Checking changelogs and version history

When user asks what changed by component/version:

```bash
# All changelog entries for a component
aplus changelog AgGrid --format json

# Changes in a specific version
aplus changelog AgGrid 7.20.4 --format json

# All changelog entries (not filtered by component)
aplus changelog AgGrid --format json
```

### 4. Diagnosing project setup

When aplus-ui does not work in a project:

```bash
# Diagnose current project
aplus doctor --format json

# Diagnose a specific project
aplus doctor /path/to/project --format json
```

Checks: whether `@aplus-frontend/ui` is declared/installed/up-to-date, and whether peer dependencies (`@aplus-frontend/antdv`, `@aplus-frontend/icon`, `@aplus-frontend/oss`, `vue`, `vxe-table`) are present without duplicates.

### 5. Analyzing component usage

When user wants usage distribution in a project:

```bash
# Scan all components in current project
aplus usage --format json

# Scan a specific directory
aplus usage /path/to/project --format json

# Filter to one component
aplus usage -c AgGrid --format json
```

Scans `js/jsx/ts/tsx/vue` files for `import { ... } from '@aplus-frontend/ui'`. Only counts names that exist in local component dataset (`data.json`) — types/hooks/utils are excluded.

### 6. Scanning for deprecated components

When migrating or checking technical debt:

```bash
# Scan current project
aplus scan --format json

# Scan a specific project
aplus scan /path/to/project --format json
```

Detects deprecated imports and suggests replacements:

| Deprecated                                       | Replacement              |
| ------------------------------------------------ | ------------------------ |
| `ApTable` / `ApGrid`                             | `AgGrid`                 |
| `EditableTable` / `EditableGrid`                 | `EditableAgGrid`         |
| `EditableTableFormItem` / `EditableGridFormItem` | `EditableAgGridFormItem` |

Uses TypeScript AST for accurate detection, including `.vue` `<script>` blocks with correct line numbers.

### 7. Exploring available components

When user is selecting components:

```bash
# List all components with name, Chinese name, description, and since version
aplus list --format json

# Quick text overview
aplus list
```

## Global Flags

| Flag | Purpose |
| --- | --- |
| `--format <format>` | Output format: `json`, `text`, or `markdown` (default: `text`) |

## Command Reference

| Command | Usage | Description |
| --- | --- | --- |
| `list` | `aplus list` | List all components |
| `info` | `aplus info <component>` | Query props, typeDefs, subComponents, demos |
| `demo` | `aplus demo <component> [name]` | Get demo source code |
| `doc` | `aplus doc <component>` | Full markdown documentation |
| `token` | `aplus token [component]` | Design tokens (all or per component) |
| `changelog` | `aplus changelog <component> [version]` | Changelog filtered by component |
| `doctor` | `aplus doctor [dir]` | Diagnose project aplus-ui setup |
| `usage` | `aplus usage [dir] -c [component]` | Component usage statistics |
| `scan` | `aplus scan [dir]` | Detect deprecated component usage |

## Key Rules

1. **Ensure CLI is up-to-date** — before first use, run `npm i -g @aplus-frontend/cli@latest`. If you encounter issues or stale data, update again.
2. **Always query before writing** — do not guess APIs from memory; run `aplus info` first.
3. **Use `--format json`** — parse JSON output instead of text regex.
4. **Check demos first** — run `aplus demo <Component> [DemoName]` for working examples.
5. **Do not ignore `typeDefs`/`subComponents`** — check them in `aplus info` before coding.
6. **Diagnose first** — for runtime/setup issues, run `aplus doctor` first.
7. **Scan after migration** — after upgrade/refactor, run `aplus scan`.
8. **Usage before refactor** — run `aplus usage -c <Component>` before large changes.
