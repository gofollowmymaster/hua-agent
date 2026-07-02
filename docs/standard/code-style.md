# 代码风格规范

本文规定 TypeScript/NestJS 代码写法。Prettier、ESLint 和 TypeScript 基线以 `AGENTS.md` 为准。

## TypeScript 基本规则

- 优先定义明确类型，避免新增无意义的 `any`。
- DTO、飞书响应、业务内部类型分别放到对应目录，不要都塞进全局类型。
- 使用项目已有路径别名，如 `@src/*`。
- 保持导入路径和同模块既有风格一致。
- 不新增无用注释；只在复杂流程前添加有助于理解的短注释。

## NestJS 分层写法

Controller：

- 只负责路由、Guard、参数接收、DTO 转换、调用 Service。
- 不写复杂业务判断。
- 不直接访问 Prisma、Redis、飞书 OpenAPI 或外部 HTTP API。
- 新增接口必须显式考虑鉴权方式。

Service：

- 负责业务流程编排和用例组织。
- 通过构造函数注入依赖，不自行 new 全局服务。
- 复杂外部系统调用下沉到 helper、adapter、table。
- 需要租户和用户上下文时注入 `TenantContext`。

DTO：

- 请求入参优先定义 DTO。
- 使用 `class-validator` 表达必要校验。
- 使用 `class-transformer` 配合全局 `ValidationPipe` 的转换能力。
- 不在 DTO 中放业务逻辑。

## 异常与错误处理

- 业务错误优先使用 `src/common/exception` 下已有异常。
- 不需要飞书上报的错误使用 `NotReportException`。
- 不直接吞掉异常；需要降级时必须记录日志或返回明确状态。
- 不在 Controller 中拼接复杂错误响应，交给全局 Filter 和 Interceptor。

## 日志规范

- 请求级日志由中间件和拦截器负责。
- 业务日志应记录关键状态、外部调用失败和不可恢复异常。
- 不记录明文敏感信息，如 token、secret、完整授权头。
- 循环或批处理中的日志要控制数量，避免刷屏。

## 配置规范

- 全局配置通过 `NodeConfigService.get` 或 `getOrThrow`。
- 租户配置通过 `NodeConfigService.getTenantConfigItem`。
- 飞书机器人配置通过 `NodeConfigService.getRobotConfig`。
- 飞书表格配置通过 `NodeConfigService.getFeishuTableConfig`。
- 敏感配置优先来自环境变量，不新增硬编码 secret。

## 命名规范

- Controller 使用 `<Feature>Controller`。
- Service 使用 `<Feature>Service`。
- DTO 使用描述动作或场景的名称，如 `CreateXxxDto`、`QueryXxxDto`。
- 飞书表格 adapter 可使用 `<Domain>Table`。
- 外部系统 adapter 使用 `<Domain><ExternalSystem>Adapter` 或同模块既有命名。

## 公共代码规范

- 只有跨模块复用的能力才放到 `src/common`。
- 小工具函数放入 `utils` 前，先判断是否应属于 helper、service、adapter 或业务模块。
- 新增公共能力必须有明确边界和调用方，不为假想复用提前抽象。
- 不引入第二套同职责技术方案，例如新的日志库、ORM、HTTP 封装方式。

## 自定义装饰器/注解规范

- 跨模块通用装饰器统一放到 `src/common/decorator/`。
- 单业务模块私有装饰器放到 `src/<module>/decorator/`。
- 装饰器文件命名使用 `*.decorator.ts`。
- 基于 `SetMetadata` 的装饰器必须同时导出稳定 metadata key。
- Guard、Interceptor、Pipe 读取装饰器元数据时，优先使用 `Reflector.getAllAndOverride`，支持方法级配置覆盖类级配置。
- 通用装饰器不放进 `interceptor/`、`guard/`、`middleware/` 等消费者目录。
