# Global Admin 开发规范

## 页面与模块

- 页面使用 `src/views/<domain>/index.vue`，复杂详情放在页面 `sections/`。
- 单文件不超过 400 行；页面负责状态编排，API 文件负责契约，store 负责跨页面状态。
- 列表优先使用 AgGrid，详情统一使用全局 LayoutDrawer 和 ApDescriptions。
- API、store、路由、认证和租户语义不得下沉到 UI Kit。

## 安全

- 不读取完整 tenant config，不在浏览器保存或展示机器人、表格、Wiki 等敏感标识。
- 不通过 hostname、header 或默认值构造租户上下文。
- 任何新增 API 必须使用 GlobalAdminGuard，并同步维护前后端契约和测试。

## UI 与验证

- 优先使用 aplus-ui；使用前查询 API 和 demo，不引用包内深路径。
- 颜色使用 `src/config/theme-color-token.ts`，不写页面临时色值。
- 代码变更至少运行 test、build、lint check、format check 和 stylelint check；登录、proxy 或抽屉交互变更需要浏览器 smoke test。
