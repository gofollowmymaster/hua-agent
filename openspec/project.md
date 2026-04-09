# Project Overview

## 1. Mission

本项目是一个基于 **NestJS** 的后端服务，目标是构建一个：

- 可维护
- 可扩展
- 可测试
- 可观测
- 可被 AI 与开发者共同协作开发

的服务端系统。

本项目采用 **OpenSpec 驱动开发**，即：

- 所有新功能、行为变更、接口调整，必须先定义 spec 或 change proposal
- 所有实现必须可追溯到 spec
- 所有变更必须经过明确的验收标准验证后才能合并

---

## 2. Product Goals

本项目的核心目标：

1. 提供稳定、清晰、可版本化的业务 API
2. 保持模块边界清晰，避免业务逻辑耦合
3. 所有外部输入必须显式校验
4. 所有关键行为必须可观测、可测试、可追踪
5. 支持后续通过 AI Agent 基于 spec 自动生成部分实现、测试和文档

---

## 3. Scope & Boundaries

### In Scope

本项目当前范围包括：

- HTTP API 服务
- 认证与授权
- 数据访问层
- 异步任务或事件处理（若项目已启用）
- 配置管理
- 日志、监控、错误处理
- OpenAPI / Swagger 文档
- 自动化测试
- OpenSpec 变更管理与规范管理

### Out of Scope

以下内容默认不在本项目当前范围内，除非变更提案明确说明：

- 前端页面或前端渲染逻辑
- 独立的数据平台或 BI 系统
- 与业务无关的基础设施大规模重构
- 未经批准的跨模块重构
- 未经批准的数据库大版本迁移
- 与当前 change 无关的“顺手优化”

### Boundary Rules

- 本项目为 **NestJS 后端服务**，不承担前端展示职责
- Controller 只负责协议层处理，不承载核心业务逻辑
- Service 负责业务编排，但不承担底层基础设施细节
- Repository / Data Access 层负责持久化访问
- 外部系统调用必须通过明确的 adapter / gateway / integration 层
- 飞书机器人集成放置在 `src/common/feishu` 目录下
- 不允许在无 spec 的情况下直接添加业务接口或修改业务行为

---

## 4. Architecture Principles

### 4.1 Layering

本项目遵循分层架构：

- **Controller Layer**
  - 处理 HTTP 请求/响应
  - 参数接收、DTO 转换、调用应用服务
  - 不写复杂业务逻辑
- **Application / Service Layer**

  - 实现业务流程编排
  - 调用 domain service / repository / external gateway
  - 负责事务边界与业务用例组织

- **Infrastructure Layer**
  - 数据库访问
  - 外部 API 调用
  - 消息队列、缓存、文件存储等

### 4.2 Dependency Direction

依赖方向必须单向清晰：

- Controller -> Service
- Service -> Repository / Gateway
- Infrastructure 不得反向依赖 Controller

### 4.3 Module Design

- 每个业务域应作为独立 NestJS module
- 模块之间通过公开接口协作，不允许随意跨层直接访问内部实现
- 避免“公共 utils 无限膨胀”
- 避免“一个 service 承载整个系统业务”

### 4.4 Business Logic Placement

禁止将以下逻辑放在 Controller 中：

- 核心业务判断
- 数据库事务逻辑
- 多步骤业务流程编排
- 复杂权限判定
- 外部系统调用编排

这些逻辑必须下沉到 Service 层。

---

## 5. Technology Baseline

### Framework

- NestJS 作为服务框架
- TypeScript 作为唯一主语言

### Recommended Core Components

可按项目实际情况选用：

- class-validator 作为参数校验工具
- Swagger 作为 API 文档生成工具，所有接口统一采用POST方法
- Prisma 作为 ORM 工具
- Jest 作为测试框架
- ESLint + Prettier 作为代码风格基线
- winston 作为统一日志方案

### Technology Consistency Rule

- 同一职责不允许并行引入多套技术方案
- 未经 proposal 批准，不得随意替换 ORM、日志组件、认证机制等核心技术栈
- 相同问题优先采用项目既有方案，而不是新增另一套实现

---

## 6. Spec Conventions

### 6.1 Baseline Specs

基线 spec 位于：

```text
openspec/specs/
```
