# RAG Admin 路由与状态规范

本文规定 RAG Admin 的路由和 Pinia 状态管理规则。

## 路由

- 路由配置集中维护在 `src/router/routes.ts`。
- 路由实例和全局守卫维护在 `src/router/index.ts`。
- 当前前端使用 hash 路由，避免 API 静态资源服务下刷新路径失效。
- 新增路由时确认页面标题、布局、鉴权要求和默认跳转行为。

## 状态管理

- Pinia 初始化位于 `src/stores/`。
- 跨页面共享或需要统一缓存的数据可以进入 store。
- 页面内一次性查询、筛选、弹窗状态优先留在组件内。
- store 不直接处理 DOM 或路由跳转细节。

## 数据流

推荐数据流：

```text
view -> api method -> http client -> API app
view -> store -> api method -> http client -> API app
```

不要让页面绕过 API 封装直接请求后端，也不要让 store 依赖后端内部源码。
