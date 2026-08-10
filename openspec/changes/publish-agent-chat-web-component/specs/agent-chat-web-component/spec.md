## ADDED Requirements

### Requirement: 提供 Web Component
SDK SHALL 注册 `<aplus-agent-chat>` 自定义元素，支持 attributes 配置后端地址、鉴权、租户和展示文案。

#### Scenario: 外部页面挂载
- **WHEN** 外部页面引入 SDK 并挂载元素
- **THEN** 页面渲染聊天交互并可配置 token

### Requirement: 不依赖 aplus-ui
SDK 和 `chat-demo` 子路径 SHALL NOT 导入或打包 `@aplus-frontend/ui`。

#### Scenario: 无 aplus-ui 环境运行
- **WHEN** 在未安装 aplus-ui 的页面使用 Web Component
- **THEN** 聊天组件正常运行
