# Spec Delta

## Purpose

定义产品部署后可访问的业务能力边界，确保用户和下游系统只能使用知识问答与业务Agent，并且已下线功能不再暴露入口或保留业务数据模型。

## ADDED Requirements

### Requirement: 管理后台仅提供两个业务模块

产品 SHALL 只发布 RAG Admin，并在导航与路由中提供知识问答和业务Agent两个业务模块；业务Agent SHALL 保留知识库、Skill、会话、配置和演示五个现有子页面。

#### Scenario: 用户进入管理后台
- **WHEN** 已登录用户访问 RAG Admin
- **THEN** 导航只展示知识问答和业务Agent及其既有子页面

#### Scenario: 用户访问未知前端路由
- **WHEN** 用户访问不属于两个保留模块的前端路径
- **THEN** 应用跳转到知识问答默认页面

### Requirement: API 仅暴露保留模块所需接口

API 服务 SHALL 只注册知识问答、RAG Admin 和业务Agent所需的业务 Controller，并继续执行现有租户解析和鉴权规则。

#### Scenario: 调用保留接口
- **WHEN** RAG Admin 调用 `/ai/rag/chat`、`/ai/rag/admin/*`、`/agent/knowledge/*` 或 `/agent/chat/*`
- **THEN** API 按现有请求、响应、鉴权和租户契约处理请求

#### Scenario: 调用已下线接口
- **WHEN** 客户端调用 Global Admin、Aily、日志操作、企微 Bot 或其他已删除业务域的 URL
- **THEN** API 返回路由不存在且不执行原业务逻辑

### Requirement: 持久化模型只服务保留模块

数据库 schema SHALL 保留知识问答和业务Agent使用的文档、分块、会话与消息模型，并通过迁移删除告警和定时任务相关表。

#### Scenario: 部署删除迁移
- **WHEN** 部署人员在已备份数据库上执行本变更迁移
- **THEN** 告警和定时任务表被删除，RAG 与业务Agent数据表保持可用

### Requirement: 工作区不再发布 Global Admin

workspace SHALL 不再包含 Global Admin 应用的开发、测试、构建或静态发布入口。

#### Scenario: 执行 workspace 构建与脚本检查
- **WHEN** 开发者检查根脚本、workspace app 和 API 静态输出
- **THEN** 不存在 Global Admin package、脚本或发布目录引用
