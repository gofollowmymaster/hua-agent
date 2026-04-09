## Why

前端项目需要统一管理埋点配置，但目前缺少从飞书多维表格拉取埋点元数据（事件名称、事件ID、事件类型）的 API 接口。该接口将为埋点平台提供标准化数据源。

## What Changes

- 在 `manage` 模块新增 `/manage/tracking-metadata` GET 接口
- 支持通过 `businessLine` 和 `eventType` 查询参数进行筛选
- 数据源：飞书多维表格（AppToken: `C6ElwN9sHiLXdKka7g5c0iSinBe`, TableId: `tblZKbrIuV52FDo`）
- 提供完整的 Swagger 文档（`@ApiTags`, `@ApiOperation`, `@ApiOkResponse`）

## Capabilities

### New Capabilities

- `tracking-metadata-api`: 埋点元数据查询接口，支持按业务线和事件类型搜索

### Modified Capabilities

## Impact

- 新增接口：`GET /manage/tracking-metadata`
- 新增目录：`src/manage/tracking-metadata/`
- 依赖飞书多维表格 API 和 `FeishuTable` 基类
- 需要注册到 `ManageModule`
