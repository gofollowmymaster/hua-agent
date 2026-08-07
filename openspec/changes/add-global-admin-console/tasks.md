## 1. 后端授权与租户目录

- [x] 1.1 新增 GlobalAdminGuard、配置与单元测试，组合现有 AuthGuard 并校验 GLOBAL appCode
- [x] 1.2 新增只读租户目录 Controller、Service、DTO 与单元测试，确保显式脱敏和稳定排序
- [x] 1.3 注册 Global Admin API 模块并更新 UserContext appCode 类型

## 2. TenantMiddleware 边界

- [x] 2.1 在 AppModule 注册层排除 Global Admin API 与静态路径，同时保留其他 middleware
- [x] 2.2 补充 middleware 排除、普通租户回归及无 TenantContext 异常路径验证

## 3. Global Admin 前端

- [x] 3.1 建立 Vue/Vite app、主题、环境配置、独立登录 store、HTTP client 和路由守卫
- [x] 3.2 实现后台布局、菜单、全局 LayoutDrawer 与 URL query 生命周期
- [x] 3.3 实现租户 API、AgGrid 列表、行点击和脱敏详情抽屉
- [x] 3.4 补充认证配置、store/API 与详情 URL 交互测试

## 4. Workspace 与文档

- [x] 4.1 更新根命令、lint-staged、workspace lockfile 和 Global Admin 静态构建输出
- [x] 4.2 新增 Global Admin AGENTS、架构和开发规范文档
- [x] 4.3 更新根治理入口以及 UI Kit、HTTP Client 消费者和验证说明

## 5. 验证

- [x] 5.1 运行 API 相关测试和构建，并回归 RAG Admin 测试与构建
- [x] 5.2 运行 Global Admin test、build、lint、format check 和 stylelint check
- [x] 5.3 运行 aplus usage/scan，并启动应用完成桌面与窄屏 smoke test
