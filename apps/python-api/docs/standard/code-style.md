# 代码风格规范

## 语言与工具基线

- 使用 Python 3.12，依赖由 uv 和已提交的 `uv.lock` 管理。
- 保留 `src/python_api/` package layout 和 `python_api.*` 绝对导入。
- Ruff 规则以 `pyproject.toml` 的 `E`、`F`、`I`、`UP`、`B`、`ASYNC` 为准。
- mypy 必须检查所有已声明函数，禁止通过无依据的 ignore 绕过类型错误。
- 行宽目标为 100；Ruff 当前忽略 `E501`，但新增说明性代码仍应主动换行。

## 导入

- 文件需要前向类型引用时保留 `from __future__ import annotations`。
- 导入按标准库、第三方包、`python_api.*` 分组，由 Ruff 维护顺序。
- 业务代码不得修改 `sys.path`，不得使用相对层级穿越导入。
- 延迟导入仅用于可选依赖、循环依赖隔离或显著启动成本，并在代码结构上体现原因。

## 命名

- 模块、函数、变量使用 `snake_case`。
- class 使用 `PascalCase`。
- 模块常量使用 `UPPER_SNAKE_CASE`。
- service 使用 `<Domain>Service`；请求 schema 使用 `<Action>Request` 或 `<Domain><Action>Request`。
- 布尔变量和配置使用可判断真假的名称，例如 `docs_enabled`、`is_system_admin`。
- 不使用含义模糊的 `data`、`item`、`value` 承载跨越多个步骤的核心业务对象。

## 类型标注

- 所有函数和方法必须声明参数与返回类型。
- 优先使用具体类型、Pydantic model、dataclass、`TypedDict`、`Protocol` 或受约束的 `Literal`。
- `Any` 只允许出现在缺少可靠类型的第三方边界、动态 JSON 解码或数据库驱动返回值处。
- `Any` 进入项目内部后必须尽快通过校验、类型守卫、转换函数或窄化结构收束。
- 不使用 `cast` 掩盖未经验证的数据；使用时必须确保运行时契约已由前置逻辑保证。
- 公共返回值不得长期使用无结构的 `dict[str, Any]`，稳定结构应定义响应 model 或 TypedDict。

## Docstring 与注释

- 新增或实质修改 class、class method 时必须添加简洁 docstring，说明职责、关键业务语义或副作用。
- public module function 和 FastAPI route 应添加一句职责说明。
- 参数和返回值已能由类型表达时，不机械重复 Args/Returns。
- 复杂算法、状态迁移、协议转换和安全边界前可添加短注释；不要逐行复述代码。
- TODO 必须包含明确问题或后续条件，不能只写“待优化”。

## 函数与文件规模

- 函数应围绕单一业务步骤组织；出现多层状态机、重复异常分支或多个外部系统时拆分私有方法或协作者。
- 单文件超过约 400 行时必须评估拆分；确因单一协议或紧密状态机保持完整时，在评审中说明理由。
- route 文件按业务边界组织，不把所有接口集中到一个全局路由文件。
- 不为假想复用提前建立 helper；公共抽象必须至少有明确的当前调用方或测试替换需求。

## 数据与常量

- 可变默认值使用 `default_factory`。
- 时间使用带时区的 `datetime`；跨边界 JSON 时间使用稳定 ISO 8601 表达。
- 状态、角色、模式等有限集合使用 `Literal`、Enum 或集中常量，不在多个模块散写字符串。
- 面向客户端的 camelCase 通过 schema alias 或集中序列化实现，Python 内部保持 snake_case。

