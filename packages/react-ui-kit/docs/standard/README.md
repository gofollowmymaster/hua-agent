# React UI Kit 开发规范

- 组件不得导入消费 app 源码、业务 API、Umi model、认证 storage、路由表或环境变量。
- 业务副作用通过 adapter、props 和回调注入；不存在行为时不渲染无效入口。
- 优先组合 Ant Design X 与 antd 公共 API，修改前核对当前安装版本类型和文档。
- `message.parts` 必须按原始顺序渲染，不把 reasoning、工具状态和正文重新分组。
- 公共 props、adapter 和返回类型必须从根入口导出，内部 helper 不导出。
- 样式 class 使用 `react-ui-kit-` 前缀，不覆盖全局 antd class，不使用消费 app 私有颜色变量。
- 组件测试覆盖可见状态、用户动作和注入回调；工作区测试覆盖历史、发送、停止、新建、清空和失败路径。
- 修改 exports、peer dependencies 或样式处理后，必须运行 React Admin 生产构建与关键聊天 E2E。
