# 业务模块结构

本文说明现有业务模块职责和当前后台处理分布。新增模块或功能的结构规范见 `docs/standard/module-design.md`。

## 模块职责

- `manage`：管理类能力，包括敏感词、供应商差异、埋点元数据等。
- `robot`：飞书机器人入口，包含消息发送、卡片消息、票据获取、飞书表格记录增删改查等。
- `ai`：AI/Aily 能力，包括 token、session 绑定、日志操作记录等。
- `admin`：管理后台能力，包括缓存管理和管理表格查询。
- `doc`：文档和知识库能力，包括飞书事件、wiki 树、搜索、黑名单、反馈和文档检查处理。
- `alert`：告警领域核心模块，处理 Sentry webhook、飞书事件/回调、告警消息、告警统计、清理和用户同步。
- `fd-copilot`：前端 Copilot 文档同步能力。
- `devops`：DevOps 发布通知、云效回调、发布确认和取消执行等。
- `demo-plugin`：插件演示和 MID 相关逻辑。
- `mock-server`：历史 mock server，当前被 `DiscardMiddleware` 标记为废弃功能。

## 定时任务与后台处理

项目已在 `AppModule` 中启用 `ScheduleModule.forRoot()`。现有定时/后台处理分布在：

- `src/alert/common/schedule`
- `src/devops/ali/common/schedule`
- `src/doc/common/schedule`
- `src/doc/common/processor`
- `src/fd-copilot/common/processor`
