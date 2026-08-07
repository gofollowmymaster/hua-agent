## 1. OpenSpec 与包骨架

- [x] 1.1 创建 proposal、design、capability spec 和实施任务清单
- [x] 1.2 创建 `@aplus-sql/ui-kit` 源码包、公共 exports 和检查脚本
- [x] 1.3 创建 `@aplus-sql/http-client` 源码包、公共 exports 和检查脚本

## 2. UI Kit 迁移

- [x] 2.1 迁移 `useRowClickAction` 并补充公共类型与单元测试
- [x] 2.2 迁移文档预览组件与 hook，改为注入 `loadFile` 并补充测试
- [x] 2.3 迁移 `TableTopActionBar`，移除 app 路由和非公开 context 依赖并补充测试

## 3. HTTP Client 实现

- [x] 3.1 实现可注入 token、401 回调和 envelope 解包的 `createHttpClient`
- [x] 3.2 补充 token、响应、错误、Blob 和 axios 配置单元测试

## 4. RAG Admin 接入

- [x] 4.1 将请求适配改为消费 `@aplus-sql/http-client`，保持业务 API 签名不变
- [x] 4.2 将公共组件与 hooks 改为消费 `@aplus-sql/ui-kit`
- [x] 4.3 显式接入文档加载、表格 reload 和兼容 persistence key，删除重复实现

## 5. Workspace 与文档

- [x] 5.1 更新 workspace 依赖、根命令、lint-staged 和 lockfile
- [x] 5.2 更新根规则、RAG Admin 架构与新包 README，明确 shared 和页面私有边界

## 6. Verification

- [x] 6.1 运行两个共享包的 typecheck、test、lint/stylelint 检查
- [x] 6.2 运行 RAG Admin test、lint、stylelint 和生产构建
- [x] 6.3 运行 aplus usage/scan 并完成开发态页面 smoke test
