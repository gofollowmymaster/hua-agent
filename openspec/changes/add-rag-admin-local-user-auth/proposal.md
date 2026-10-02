## Why

RAG Admin 依赖外部登录 SDK，无法独立维护后台用户。需要在 API 内建立租户隔离的本地账号、登录与用户管理能力，同时保持现有 JWT 鉴权契约。

## What Changes

- 新增 RAG PostgreSQL 用户表、初始化系统管理员和本地账号密码登录。
- 新增仅系统管理员可用的用户管理 API。
- 移除 RAG Admin 的登录 SDK，新增本地 `/login` 页面与路由守卫。

## Capabilities

### New Capabilities

- `rag-admin-local-user-auth`: 定义本地用户、登录、JWT 签发和系统管理员边界。

### Modified Capabilities

无。

## Impact

影响 API 数据模型、认证模块、环境模板、RAG Admin 的依赖、路由和 user store。

## Non-goals

- 不提供注册、找回密码、角色权限配置或用户管理页面。
- 不修改既有业务接口的 Bearer JWT 鉴权方式。
