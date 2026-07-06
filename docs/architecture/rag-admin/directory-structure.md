# RAG Admin 目录架构

本文说明 `apps/rag-admin` 的目录职责和边界。实现规范见 `docs/standard/rag-admin/README.md`。

## 顶层目录

- `apps/rag-admin/package.json`：前端依赖和 Vite 脚本。
- `apps/rag-admin/vite.config.ts`：Vite 插件、别名、proxy、base 和构建输出配置。
- `apps/rag-admin/src/`：前端源码。
- `apps/rag-admin/.env*`：前端环境变量，仅 `VITE_` 前缀会进入浏览器构建产物。

## src 目录

- `main.ts`：Vue app 入口。
- `App.vue`：根组件。
- `api/`：axios 实例和业务 API 封装。
- `auth/`：登录中心、token cookie 和鉴权相关前端逻辑。
- `layouts/`：后台布局组件。
- `router/`：路由实例和路由表。
- `stores/`：Pinia store 入口和模块。
- `styles/`：全局样式。
- `views/`：页面级组件。
- `env.d.ts`：Vite/TypeScript 环境类型声明。

## 边界

- 页面级组件放在 `views/`，可复用布局放在 `layouts/`。
- API 请求统一放在 `api/`，页面不直接创建 axios 实例。
- 登录和 token 逻辑统一放在 `auth/`，页面不直接拼接 `Authorization`。
- 前端不读取后端 `.env*`，不引用后端源码路径。
