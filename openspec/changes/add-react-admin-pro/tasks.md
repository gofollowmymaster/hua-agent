# Tasks

## 1. 工程与运行边界

- [x] 1.1 创建 Umi Max React app、固定依赖和基础配置，验证 `pnpm install` 与空应用构建成功
- [x] 1.2 增加根命令、lint-staged 和独立静态输出配置，验证 Vue/React 构建目录互不覆盖
- [x] 1.3 编写 React app 的 AGENTS、架构与开发文档，并静态检查文档中的路径和命令

## 2. 认证、请求与布局

- [x] 2.1 实现租户解析、JWT、Pinia 持久化兼容和认证 model，以 Vitest 覆盖正常与损坏数据
- [x] 2.2 实现 HTTP client、业务 envelope、普通请求和流式请求 401 处理，以单元测试验证清理与跳转
- [x] 2.3 实现登录页、受保护路由、兼容重定向和 ProLayout，以组件测试验证登录回跳、菜单及退出
- [x] 2.4 实现 URL query 驱动的全局抽屉，以测试验证打开、替换、关闭和刷新恢复

## 3. 知识问答运营页面

- [x] 3.1 实现知识文档 API、ProTable 和索引/删除操作，以组件测试验证筛选、分页和确认流程
- [x] 3.2 实现上传与元数据 Modal，以测试覆盖格式、数量、大小、逐文件结果和提交刷新
- [x] 3.3 实现文件预览与文档切片抽屉，以测试覆盖 viewer 生命周期、分页、加载和错误态
- [x] 3.4 实现会话 ProTable 与消息抽屉，以测试验证查询、摘要、深链和消息加载

## 4. 业务 Agent 与聊天

- [x] 4.1 实现业务知识 API、ProTable、文档预览和切片抽屉，以组件测试验证 ID、筛选、入库、重建和删除
- [x] 4.2 实现框架无关的 React ChatDemo shell 和状态管理，以测试覆盖历史、新建、发送、停止、清空和错误态
- [x] 4.3 实现知识问答 chat adapter 和引用预览，以测试覆盖历史映射、鉴权 header、状态格式与内部链接解析
- [x] 4.4 实现业务 Agent chat adapter，以测试覆盖有序 parts、非法 parts 和 legacy toolCalls 回退
- [x] 4.5 实现两套 Demo 页面及三个占位页面，以组件测试验证菜单入口和页面状态

## 5. 集成与交付

- [x] 5.1 增加 Playwright mock API 冒烟测试，验证登录、菜单、列表、抽屉、上传、预览和两套聊天的桌面/窄屏流程
- [x] 5.2 更新 workspace README、AI 治理和 API 静态资源文档，验证不再存在“唯一后台”的过期描述
- [x] 5.3 运行 React lint、format check、test、build，以及 Vue Admin、HTTP client 和根 workspace 构建并记录结果

## 6. 石墨青绿主题

- [x] 6.1 建立 React Admin 集中主题模块，统一 Ant Design、ProLayout 与业务 CSS 语义颜色
- [x] 6.2 重构登录、布局、表格容器、预览、占位页和聊天视觉，保持现有结构、12px 页面边距和交互
- [x] 6.3 增加主题 token、租户共用主题、聊天状态色和 Playwright 视觉断言，并完成质量验证与截图检查
