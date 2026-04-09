## Context

埋点元数据存储在飞书多维表格中，现有 `manage` 模块已通过 `FeishuTable` 基类封装了类似能力（如 `SupplierDiffTable`），可复用该模式。当前系统无缓存机制，需考虑飞书 API 限流问题。

## Goals / Non-Goals

**Goals:**

- 提供 GET 接口获取埋点元数据列表
- 支持按业务线（`businessLine`）和事件类型（`eventType`）筛选
- 返回字段：`eventName`, `eventId`, `eventType`
- 集成 Swagger 文档

**Non-Goals:**

- 不实现写操作（CRUD 中的 CUD）
- 不修改飞书多维表格结构
- 不引入新外部依赖（仅复用现有 `FeishuTable` 和 `TableHelper`）

## Decisions

1. **复用 FeishuTable 模式**：继承 `FeishuTable` 基类，配置 `appToken=C6ElwN9sHiLXdKka7g5c0iSinBe` 和 `tableId=tblZKbrIuV52FDo`，避免重复造轮子
2. **查询参数驱动过滤**：使用 NestJS 的 `@Query()` 装饰器接收 `businessLine` 和 `eventType`，传入 `searchTransformed()` 方法进行客户端过滤
3. **响应结构扁平化**：调用 `searchTransformed()` 得到统一结构 `{ eventName, eventId, eventType }`，无需额外映射
4. **缓存策略**：使用 `@CacheTTL(600)`（10 分钟）缓解飞书限流压力

## Risks / Trade-offs

- [飞书 API 限流] → 缓存 TTL=600s，命中缓存则不触发飞书请求
- [飞书字段变更] → 依赖 `searchTransformed()` 的字段映射，若飞书表结构调整，需同步更新映射逻辑
