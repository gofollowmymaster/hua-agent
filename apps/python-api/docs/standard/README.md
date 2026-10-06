# Python API 开发规范

`apps/python-api/docs/standard/` 规定 `apps/python-api` 后续开发必须遵守的目标规则。当前架构事实见 `../architecture/README.md`，尚未满足目标规则的实现见 `current-gaps.md`。

本文档目录中的 `src/` 默认指 `apps/python-api/src/`，`python_api/` 默认指 `apps/python-api/src/python_api/`。

## 规则级别

- “必须”表示新增代码和被实质修改的代码需要满足，除非在变更说明中记录理由和风险。
- “应”表示默认选择；偏离时需要有明确的实现收益。
- `current-gaps.md` 中的既有问题不因本规范生效而自动变成当前任务的整改范围。

## 阅读顺序

1. `code-style.md`：语言、类型、命名、导入、docstring 和文件组织。
2. `module-design.md`：router、schema、service、model 和基础设施边界。
3. `api-contract.md`：HTTP、鉴权、响应、错误、文件和 SSE 契约。
4. `data-and-integration.md`：数据库、租户、Redis、异步、文件和外部服务。
5. `testing-and-verification.md`：测试分层、验证矩阵和交付要求。
6. `current-gaps.md`：当前实现与目标规范之间的已知差距。
7. `fastapi-best-practices.md`：上游最佳实践的采用、调整与不适用矩阵。

## 任务阅读路由

| 任务 | 必读规范 |
| --- | --- |
| 新增 route、schema 或修改接口 | `module-design.md`、`api-contract.md` |
| 修改 service 或业务流程 | `module-design.md`、`code-style.md` |
| 修改数据库、Redis、租户或文件 | `data-and-integration.md`、`api-contract.md` |
| 修改模型、飞书或其他外部 provider | `data-and-integration.md`、`testing-and-verification.md` |
| 修改 Agent、RAG 或 SSE | `api-contract.md`、`testing-and-verification.md` |
| 处理技术债或大范围重构 | `current-gaps.md` 及受影响专题 |

## 基础验证命令

```bash
pnpm python-api:lint
pnpm python-api:typecheck
pnpm python-api:test
pnpm python-api:build
```

按变更风险选择必要命令，不得用构建成功替代行为测试。仅修改 Markdown 时执行文档静态检查和 `git diff --check` 即可。
