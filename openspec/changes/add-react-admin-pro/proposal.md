# Proposal

## Why

现有管理后台仅有 Vue 实现，无法直接使用团队计划采用的 React Ant Design Pro 技术体系。需要在不影响现有后台和后端契约的前提下新增一套功能等价、可独立验收和回滚的 React 管理后台。

## What Changes

- 新增 `apps/react-admin`，使用 Umi Max、React 18、Ant Design 6 和 ProComponents 3.1 beta。
- 迁移当前 RAG Admin 的登录、布局、知识库、会话、两套聊天 Demo、文档预览和占位页面行为。
- 新增独立开发、测试、构建命令，并将静态产物发布到 `/public/react-admin/`。
- 保留现有 Vue RAG Admin，不修改后端 API、数据库或鉴权协议。
- 补充 React app 的架构、开发和验证文档。

## Capabilities

### New Capabilities

- `react-admin-console`: 定义并行 React 管理后台的认证、导航、知识管理、会话查看、流式聊天、文件预览和构建发布行为。

### Modified Capabilities

无。

## Non-goals

- 不替换或下线 `apps/rag-admin`。
- 不补齐当前 Vue 后台中的占位业务模块。
- 不新增用户管理、菜单权限、后端 API 或数据库能力。
- 不要求与 Vue 后台像素级一致。

## Impact

新增 React app 及前端依赖，调整 workspace 根脚本、lint-staged、README、AI 治理和静态资源文档。API 继续通过现有 `/public` 静态根目录发布两个后台，业务接口和运行时数据保持不变。
