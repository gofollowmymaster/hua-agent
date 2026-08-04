## Context

RAG 最终答案当前由 LangGraph 的生成节点调用一份 `ChatOpenAI` 实例，同步模式使用 `invoke`，流式模式使用 `stream` 并把文本写为自定义事件。查询改写已经使用独立的 `qwen-turbo`。DashScope 通过 OpenAI compatible endpoint 返回 reasoning，但 LangChain 只为其识别的 OpenAI reasoning model 自动映射 effort，因此 Qwen 需要显式通过 `modelKwargs` 发送参数。

## Goals / Non-Goals

**Goals:**

- 最终答案默认以 `xhigh` 强度推理，并在不支持或失败时自动普通生成。
- 在 SSE 和 AGUI 中增量展示供应商 reasoning，同时确保答案、消息和记忆只包含最终文本。
- 保持同步响应、企微输出、查询改写和既有状态事件兼容。
- 记录可观测但不敏感的推理配置与降级状态。

**Non-Goals:**

- 不增加公开请求参数、数据库字段、推理内容持久化或二次总结。
- 不为查询改写启用推理，不修改检索、重排和 Prompt 逻辑。

## Decisions

### 1. 使用两份同模型配置的回答客户端

回答服务创建推理客户端和普通 fallback 客户端。推理客户端通过 `modelKwargs.reasoning_effort` 强制发送经校验的 `RAG_REASONING_EFFORT`，普通客户端不携带该参数。两者共享模型名、endpoint、密钥和温度。

选择两份客户端而不是每次动态改写 invocation options，是为了明确保证 fallback 请求不泄漏推理参数，也方便单元测试。查询改写服务继续独立创建普通 `qwen-turbo` 客户端。

### 2. 生成节点负责推理与答案分流

同步模式先调用推理客户端；调用抛错时记录降级日志并调用普通客户端。流式模式识别 `additional_kwargs.reasoning_content` 和标准 `{ type: 'reasoning', reasoning }` block，将 reasoning 写为独立图 custom event；普通字符串与 text block 仅累积到最终答案。推理流异常或最终答案为空时，发送既有 fallback 状态并调用普通客户端生成答案。

该边界使 reasoning 不进入图的 `answer` 状态，因此助手消息、同步结果和后续记忆天然保持隔离。供应商未返回 reasoning 时不补造内容。

### 3. 协议层仅做标准映射

`RagStreamEvent` 增加 `reasoning` 字符串增量。SSE controller 延续透明转发；企微延续只消费 `answer`。AGUI adapter 在首个 reasoning 增量输出 `reasoning-start`，逐段输出 `reasoning-delta`，并在首个答案前或流结束时输出 `reasoning-end`，随后保持现有 text 事件。

RAG Admin 把 AI SDK 的 reasoning part 委托给独立 `AssistantReasoning` 组件。由于 aplus-ui 没有折叠组件，使用可访问的原生 `details/summary`：流式期间展开，完成后折叠。

### 4. 配置与观测不记录正文

集中配置校验 `RAG_REASONING_EFFORT` 的标准枚举，默认 `xhigh`。LangGraph metadata 与降级日志只记录 effort、是否 fallback、tenant/session/channel 等已有标识，不记录 reasoning、问题、Prompt、答案或文档正文。

## Risks / Trade-offs

- [Risk] DashScope endpoint 拒绝或忽略 `reasoning_effort` → 推理调用失败时自动使用不带参数的同模型客户端；忽略参数时仍按供应商实际返回内容工作。
- [Risk] reasoning block 格式随 SDK 或供应商变化 → 同时兼容 DashScope `reasoning_content` 与标准 reasoning content block，并用测试固定解析行为。
- [Risk] reasoning 增加延迟与 token 成本 → effort 集中配置可在部署时调整，日志和 trace 暴露非敏感降级信息。
- [Trade-off] 同步和企微调用承担推理耗时但不展示 reasoning → 保持公开契约和渠道体验一致，用户只得到最终答案。

## Migration Plan

1. 部署配置、双模型生成与协议适配；默认启用 `xhigh`。
2. 验证 SSE/AGUI reasoning 顺序、同步与企微兼容性及 fallback 指标。
3. 若供应商兼容性或成本不可接受，将 `RAG_REASONING_EFFORT` 调整为受支持档位；代码级回滚不涉及数据迁移。

## Open Questions

无。
