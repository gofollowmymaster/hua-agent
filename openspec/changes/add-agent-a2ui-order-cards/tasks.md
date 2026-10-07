## 1. Protocol and backend

- [x] 1.1 Compile supported DS-order tool output into restricted A2UI v0.9 parts.
- [x] 1.2 Persist A2UI commands and add a Bearer-protected action endpoint.
- [x] 1.3 Add compiler, action authorization, stale-state, and history tests.

## 2. React rendering

- [x] 2.1 Add x-card dependency and an optional shared-chat A2UI renderer hook.
- [x] 2.2 Render local-catalog order cards with persistent inline action forms.
- [x] 2.3 Add adapter, card, and browser-flow tests.

## 3. Verification

- [x] 3.1 Run focused and workspace validation, then record results.

Validation notes: Python lint, mypy, 92 tests and package build passed. React Admin lint, 42 tests, Ant Design lint, production build and the new desktop/narrow card E2E passed. Full `react-admin:check` remains blocked by three pre-existing unformatted files, and React UI Kit retains two pre-existing assertions for hidden tool-result summary text.
