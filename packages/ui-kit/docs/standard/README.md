# UI Kit 开发规范

`packages/ui-kit/docs/standard/` 记录 UI Kit 的组件、hooks、导出、依赖和验证规范。架构边界见 `packages/ui-kit/docs/architecture/README.md`。

## 阅读顺序

1. `package-design.md`：内容准入、公共 API、组件/hooks、依赖和测试规则。
2. 受影响前端 app 的 `docs/standard/README.md`：Vue/TypeScript 和 aplus-ui 实现规范。
3. `../../../../docs/standard/design/README.md`：整体产品设计与交互约定。

## 验证入口

修改 UI Kit 后至少运行：

```bash
pnpm ui-kit:build
pnpm ui-kit:test
pnpm ui-kit:lint:check
pnpm ui-kit:stylelint:check
```

同时运行所有受影响消费 app 的类型检查和生产构建；当前运行 `pnpm admin:build`。涉及运行时交互时启动消费 app 做页面 smoke test。
