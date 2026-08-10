## ADDED Requirements

### Requirement: 按模块和菜单组织 API
RAG Admin 前端 API SHALL 按 `src/api/<module>/<menu>.ts` 组织，同一模块放在同一目录，同一菜单放在同一文件。

#### Scenario: 业务知识库 API 独立成文件
- **WHEN** 新增或修改业务知识库请求
- **THEN** 请求定义放在 `src/api/business-agent/knowledge.ts`

### Requirement: 公共定义放入 common
HTTP client、分页类型和参数清洗等公共定义 SHALL 放在 `src/api/common`。

#### Scenario: 公共分页类型复用
- **WHEN** 多个菜单 API 需要分页类型
- **THEN** 从 `src/api/common/types.ts` 导入

### Requirement: 页面按菜单文件导入
页面和组件 SHALL 只从对应菜单 API 文件导入业务请求，不再集中从一个总文件导入。

#### Scenario: 文档管理页面导入
- **WHEN** 文档管理页面发起请求
- **THEN** 从 `src/api/knowledge-qa/documents.ts` 导入
