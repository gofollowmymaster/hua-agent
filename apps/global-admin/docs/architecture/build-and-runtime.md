# Global Admin 构建与运行

- Vite dev port：`5175`。
- base：`/public/global-admin/`。
- 生产输出：`apps/api/public/global-admin`。
- `/global-admin` 开发代理默认指向 `http://localhost:3000`。
- 生产静态资源由 API app 的 `/public` ServeStaticModule 提供。

开发使用 `pnpm global-admin:dev`，生产构建使用 `pnpm global-admin:build`。前端环境变量只允许浏览器可公开的 `VITE_` 配置，认证 API 地址放在部署环境或未提交的 local env 文件中。
