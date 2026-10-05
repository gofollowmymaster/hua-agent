## 1. DS 订单 Mock API

- [x] 1.1 新增 DS 订单 DTO、类型和虚构 fixtures
- [x] 1.2 实现按租户隔离的列表、详情、日志、审核和取消 Mock Service
- [x] 1.3 新增保留原请求地址和既有 Guard 的 Controller

## 2. Agent 工具

- [x] 2.1 新增 5 个 DS 订单工具及受限 Zod schema
- [x] 2.2 在 Agent 工具聚合和系统提示词中接入 DS 能力
- [x] 2.3 注册新增 Controller 和 Service，保留停用的文档切片工具

## 3. 测试与验证

- [x] 3.1 覆盖筛选分页、租户隔离和状态流转 Service 测试
- [x] 3.2 覆盖 Controller 路由透传和工具注册/调用测试
- [x] 3.3 修正停用文档切片工具对应的过期测试
- [x] 3.4 运行聚焦 Jest、API lint、API build 和 diff 检查
