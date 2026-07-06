# Shared 包开发规范

`docs/standard/shared/` 记录 `packages/shared` 的开发规范。架构边界见 `docs/architecture/shared/README.md`。

## 阅读顺序

1. `package-design.md`：类型、导出、依赖和消费者验证规则。

## 验证入口

修改 shared 后，必须验证所有受影响消费者：

- API 消费者：运行相关 API 测试或构建。
- RAG Admin 消费者：运行 `pnpm rag-admin:build`。

如果 shared 当前没有消费者，交付说明中明确说明只做静态检查。
