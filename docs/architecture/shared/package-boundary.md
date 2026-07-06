# Shared 包边界

本文记录 `packages/shared` 的架构边界。

## 适合放入 shared 的内容

- 前后端都需要的稳定 DTO/接口类型。
- 与运行环境无关的常量。
- 无副作用、无平台依赖的小工具函数。

## 不适合放入 shared 的内容

- NestJS provider、Controller、Service、Module。
- Vue 组件、composable、store。
- Prisma client、Prisma model 访问逻辑、数据库连接。
- 浏览器专属或 Node 专属运行时代码。
- 飞书、Redis、BullMQ、axios 实例等基础设施封装。

## 当前约束

shared 包必须保持轻量。没有真实跨端复用需求时，不要提前抽象到 shared。跨端通过 HTTP API 契约协作，shared 只承载稳定且值得共享的类型或工具。
