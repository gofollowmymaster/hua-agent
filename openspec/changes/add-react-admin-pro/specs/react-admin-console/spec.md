# Spec Delta

## Purpose

提供与现有 Vue RAG Admin 并行运行的 React 管理后台，使管理员可通过 Ant Design Pro 界面完成当前知识管理、会话查看、流式问答和业务 Agent 操作，并保持既有服务契约和访问隔离。

## ADDED Requirements

### Requirement: 独立构建与访问
系统 SHALL 将 React Admin 作为独立 workspace app 构建和运行，其静态资源 SHALL 发布到 `/public/react-admin/`，且不得覆盖现有 Vue RAG Admin 产物或访问路径。

#### Scenario: 两套后台并行构建
- **WHEN** 执行 workspace 开发构建
- **THEN** 系统分别生成 Vue RAG Admin 与 React Admin 产物
- **THEN** 两套产物位于不同静态目录

### Requirement: 等价认证与租户上下文
React Admin SHALL 复用现有登录 API、租户 hostname 映射、Bearer token 和 401 语义，并 SHALL 兼容现有 `authToken` 本地持久化格式。

#### Scenario: 登录后返回原目标
- **WHEN** 未登录用户访问受保护路由并成功登录
- **THEN** 系统携带当前租户 `supplier` 请求登录 API
- **THEN** 系统返回用户最初访问的受保护路由

#### Scenario: 未授权响应
- **WHEN** 任意普通请求或流式聊天请求收到 HTTP 401
- **THEN** 系统清除本地认证状态并进入登录页

### Requirement: 管理后台导航等价
React Admin SHALL 提供与当前 Vue RAG Admin 相同的知识问答和业务 Agent 菜单、兼容重定向、页面标题、折叠偏好及退出登录行为。

#### Scenario: 打开管理后台
- **WHEN** 已登录用户进入 React Admin
- **THEN** 系统展示知识问答与业务 Agent 的全部现有菜单
- **THEN** Skill 管理、业务会话管理和配置中心保持占位状态

### Requirement: 知识问答运营能力
React Admin SHALL 提供现有文档查询、上传、预览、元数据维护、切片查看、删除、索引重建、会话查询和消息查看能力，并保持当前校验、确认和错误反馈语义。

#### Scenario: 管理文档
- **WHEN** 管理员在文档列表执行上传、编辑、预览、查看切片、删除或重建操作
- **THEN** 系统调用现有 API 并展示与当前 Vue 后台等价的结果、加载态和错误态

#### Scenario: 深链打开详情抽屉
- **WHEN** 用户使用包含 `drawer` 和 `drawerCode` 的页面链接
- **THEN** 系统在刷新或新标签打开后恢复相应文档切片或消息记录抽屉

### Requirement: 业务 Agent 知识管理能力
React Admin SHALL 提供业务知识库关键词、分类和状态查询，以及数据库 ID、预览、切片、入库、强制重建和删除操作。

#### Scenario: 查询和操作业务知识
- **WHEN** 管理员筛选业务知识或执行文档操作
- **THEN** 系统使用现有 `/agent/knowledge` API 返回并更新当前租户的数据

### Requirement: 流式聊天等价
React Admin SHALL 为知识问答和业务 Agent 提供历史会话、新建、发送、停止和清空能力；业务 Agent 可见的 reasoning、文本、工具调用和结果 SHALL 按事件先后顺序展示。

#### Scenario: 业务 Agent 新格式历史消息
- **WHEN** 历史消息包含有效的有序 `parts`
- **THEN** 系统严格按 `parts` 顺序展示全部可见事件

#### Scenario: 业务 Agent 旧格式历史消息
- **WHEN** 历史消息不包含有效的有序 `parts`
- **THEN** 系统先展示旧工具调用结果再展示最终文本，不推断不存在的原始交错顺序

#### Scenario: 知识问答引用预览
- **WHEN** 用户点击知识问答答案中的内部文档预览链接
- **THEN** 系统拦截链接并在当前页面打开对应文件预览

### Requirement: 浏览器文件预览
React Admin SHALL 支持当前后台已支持的图片、PDF、Office 和文本文件预览，并 SHALL 在关闭或切换文件时释放 viewer 和临时资源。

#### Scenario: 关闭文件预览
- **WHEN** 用户关闭预览弹窗或组件卸载
- **THEN** 系统销毁文件 viewer 并释放所创建的临时 URL

### Requirement: 一致且可访问的视觉主题
React Admin SHALL 对所有租户使用集中的石墨中性色与青绿色强调主题，并 SHALL 保持关键文字、控件和状态信息达到 WCAG AA 对比度。

#### Scenario: 切换租户入口
- **WHEN** 用户通过 A、C 或 D 租户 hostname 打开 React Admin
- **THEN** 系统保留对应租户名称和字母标识
- **THEN** 登录页、管理布局和业务页面使用同一套主题 token

#### Scenario: 展示业务 Agent 流式状态
- **WHEN** 业务 Agent 依次展示 reasoning、工具调用、工具结果、生成状态和错误状态
- **THEN** 系统使用中性、琥珀、青绿、信息蓝和错误红语义样式
- **THEN** 状态样式不改变事件的原始展示顺序

