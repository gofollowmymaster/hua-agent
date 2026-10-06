# Spec Delta

## Purpose

将 React Admin 的 Skill 管理从占位页面升级为与 Vue RAG Admin 等价的可用页面。

## MODIFIED Requirements

### Requirement: 管理后台导航等价
React Admin SHALL 提供与 Vue RAG Admin 相同的知识问答和业务 Agent 菜单、兼容重定向、页面标题、折叠偏好及退出登录行为；Skill 管理 SHALL 提供可用的系统 Skill 与用户 Skill 双 Tab，会话管理和配置中心继续保持占位状态。

#### Scenario: 打开管理后台
- **WHEN** 已登录用户进入 React Admin
- **THEN** 系统展示知识问答与业务 Agent 的全部现有菜单
- **THEN** Skill 管理展示系统 Skill 与用户 Skill 双 Tab
- **THEN** 业务会话管理和配置中心保持占位状态
