# 管理后台命名规范

## 1. 适用范围

本文档负责管理后台的命名口径，重点覆盖以下类别：

- 路由 path 和路由 name。
- 页面文件与页面目录。
- API 方法名和业务类型名。
- 常量名。
- 权限、菜单标识、`TableKey` 和埋点 key 的命名格式。

## 2. 命名目标

- 可读：看到名字就能判断归属。
- 可检索：能稳定用业务域和模块名全局搜索。
- 可复用：同一模块命名段稳定，不出现同义多写。
- 可执行：Agent 可以按固定步骤决定命名，而不是只看格式示例。

## 3. 统一语义段

业务标识类命名统一按以下语义段组织：

```text
<app> -> 业务域 -> 模块名 -> 动作 / 表语义
```

说明：

- `<app>`：固定前缀，标识管理后台应用。
- `业务域`：稳定业务域（如 `<domain>`）。
- `模块名`：稳定业务模块（如 `<module-name>`）。
- `动作 / 表语义`：如 `list`、`export`、`main-table`、`click-export`。

## 4. 命名决策步骤

新增命名时，按下面顺序判断：

1. 先判定类别：路由、页面、API、类型、常量，还是未来权限/菜单/TableKey/埋点。
2. 再确认它属于哪个业务域和模块名，优先复用目录语义。
3. 再补齐动作或表语义，不要使用模糊词。
4. 最后全局搜索是否已有同模块稳定命名，避免近义重复。

## 5. 通用约束

- 同一模块内，模块名和动作名必须保持稳定。
- 不允许无业务语义的缩写，除非是项目公认术语。
- 优先复用目录语义，不额外造词。
- 不在多个页面中为同一语义维护不同名称。
- `AGENTS.md`、`README.md` 等约定文件名保留原名，不做 kebab-case 转换。

## 6. 路由与页面

- 路由 path 使用 `kebab-case`，避免拼音、无意义缩写或过深层级。
- 路由 name 使用 `kebab-case`，或沿用同文件既有风格。
- 页面组件文件使用 `kebab-case.vue`。
- 页面目录、页面文件和组件文件统一使用 `kebab-case`，入口文件统一为 `index.vue`。

示例：

```ts
{
  path: '/documents',
  name: 'documents',
  component: () => import('@/views/<module>/index.vue'),
  meta: { title: '文档管理' },
}
```

## 7. API 方法与类型

- API 方法名使用 `camelCase`，表达业务语义。
- 类型名使用业务语义后缀，例如 `<Module>Item`、`<Module>PageParams`。
- 类型导入使用 `import type`。
- 请求、响应类型靠近 API 封装放置，跨端稳定类型才考虑进入共享包（如 `packages/shared`）。

示例：

```ts
export function pageDocuments(params: Record<string, unknown>) {
  return post<PageResult<DocumentItem>>('/<domain>/<resource>/page', params);
}
```

## 8. 常量

- 普通常量使用语义化名称；模块内固定常量可使用 `UPPER_SNAKE_CASE`。
- 状态枚举 key 优先使用后端返回语义或既有 `valueEnum` 口径。
- 页面级常量放在页面目录或页面同级 helper 中，不上提到全局。

示例：

```ts
const HISTORY_PAGE_SIZE = 20;

const statusValueEnum = {
  ready: { text: 'ready' },
  failed: { text: 'failed' },
};
```

## 9. 按钮权限

### 9.1 存放位置

- 位于模块目录或页面目录下的 `authority.ts`。

### 9.2 命名格式

```text
<APP>_<MODULE>_<ACTION>
```

### 9.3 约束

- `MODULE` 使用大写下划线。
- `ACTION` 使用明确动作语义，如 `ADD`、`EDIT`、`DELETE`、`EXPORT`、`DETAIL`。
- 不允许使用缺少模块前缀的值。
- 同一个按钮权限在多处使用时，默认共用一个权限。

### 9.4 示例

```ts
export enum AUTHORITY_ENUM {
  EDIT = '<APP>_<MODULE>_EDIT',
  DELETE = '<APP>_<MODULE>_DELETE',
}
```

## 10. 菜单标识

### 10.1 命名格式

```text
<app>-<business-domain>-<module-name>-<action>
```

### 10.2 示例

```ts
export const <MODULE>_MENU_KEY =
  '<app>-<domain>-<module>-list';
```

## 11. 与其他规范的职责边界

- 目录和模块如何命名、哪些目录属于历史兼容：查看 `docs/standard/frontend/development/directory-structure.md` 和 `docs/standard/frontend/development/page-structure-blueprint.md`。
- 路由和状态管理：查看所在应用架构文档（如 `apps/*/standard/architecture/custom/project-architecture.md`）。
- 当前任务到底该去哪个目录：查看对应层级 `AGENTS.md`。
