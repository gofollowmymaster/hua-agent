# Global Admin 后端模块边界

`src/global-admin/` 是无租户总控台后端能力的唯一业务归属。`GlobalAdminModule` 是聚合入口，`AppModule` 只负责注册该模块和配置 `TenantMiddleware` 排除范围。

## 目录约束

```text
src/global-admin/
├── global-admin.module.ts
├── global-admin.constants.ts
├── common/
│   └── guard/
│       └── global-admin.guard.ts
└── tenant/
    ├── tenant.controller.ts
    ├── tenant.service.ts
    └── dto/
        └── tenant.dto.ts
```

- 租户管理是 `GlobalAdminModule` 内的 `tenant/` 业务子模块，Controller、Service、DTO 和测试均放在该目录。
- Global Admin 专用鉴权放在模块内部的 `common/guard/`，由 `GlobalAdminModule` 注册；此处 `common` 不代表全局 `src/common/`，不得放入或导出自通用 `GuardModule`。
- 后续新增总控台业务时，为每个 HTTP Controller 建立独立子模块目录，由 `GlobalAdminModule` 统一注册 Controller 和 provider；按 API 模块规范不额外创建子模块 Nest Module。
- `global-admin/` 内部实现不得被其他业务模块跨目录直接引用；需要共享时先定义明确的父模块公开 Service 或 adapter。

## 依赖边界

- 可以依赖 `common` 中已存在的通用基础设施，例如 `AuthGuard`、异常类型和日志能力。
- 不得注入或读取 `TenantContext`，也不得通过默认租户执行总控台业务。
- 租户目录当前读取静态 tenant config，不使用 Prisma；以后引入持久化前必须单独评审数据模型和跨租户权限边界。
- `AppModule`、`common/` 和其他业务模块不得承载 Global Admin 专用 Controller、Service、DTO、Guard 或业务规则。
