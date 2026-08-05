# RAG Admin 样式规范

本文规定 RAG Admin 的样式组织和 UI 使用规则。

## 样式入口

- `src/styles/global.less` 只放全局公共样式：reset、body、通用页面容器、通用表格容器和通用文本工具类。
- 布局专属样式放在对应布局组件的 `<style scoped>` 中，不放入 `global.less`。
- 具体模块、页面或 section 的专属样式放在对应 `.vue` 组件的 `<style scoped>` 中，不放入 `global.less`。
- 跨项目稳定复用的通用样式才考虑沉淀到 `styles/`，沉淀前必须确认真实复用需求。

## UI 组件

- 页面开发强制优先使用 `@aplus-frontend/ui`，这是 RAG Admin 的默认 UI 组件来源。
- 表格、表单、详情、弹窗、抽屉、分页、筛选、按钮、提示等后台常见控件，默认使用 aplus-ui 的成熟组件或项目中基于 aplus-ui 的既有封装。
- 编写 aplus-ui 相关代码前先查组件 API、类型、子组件和示例；不要凭记忆猜 props。必要时使用 `aplus info <Component> --format json`、`aplus demo <Component> ... --format json`。
- `@aplus-frontend/antdv` 作为公司组件体系的一部分使用；只有 aplus-ui 无法满足场景、项目已有 antdv 封装更合适，或存在明确技术限制时，再考虑 Ant Design Vue 能力。
- 原生 HTML 控件仅用于 aplus-ui 没有合适控件、或语义/可访问性明显更合适的场景。
- 表格、分页、表单、详情、弹窗、抽屉、提示等常见控件应保持同一交互风格。
- 不新增第二套同职责 UI 框架。
- 新增组件封装前先搜索是否已有 aplus-ui 或项目内既有组件可复用；若新增封装，应优先基于 aplus-ui 组合，而不是从原生控件重做。

## 可维护性

- 避免在多个页面复制大段样式。
- 避免依赖脆弱的深层选择器覆盖第三方组件；确需覆盖时限制作用域。
- 保持布局在常见桌面宽度下可读，避免文本和按钮重叠。
- 样式类名使用语义化 kebab-case，优先体现模块和职责，例如 `assistant-history-item`。
- 页面样式不要污染全局；确需全局样式时放入 `src/styles/global.less` 并说明适用范围。
- 新增样式时先判断归属：全局公共 → `global.less`；布局 → 布局组件；模块/页面/section → 对应组件。
- 禁止把某一个模块专用样式或布局样式写入 `global.less`。
- Less 样式中颜色统一使用 `@primary-color`、`@text-primary-color` 等变量，禁止在 `.less` 中重复写色值。
- 需要命名空间前缀时使用 Less 变量 `@namespace`，不硬编码应用名。

## 预设颜色规范

- 项目中只能使用预设颜色，且只能通过变量形式使用：Less 样式统一使用 `@primary-color`、`@text-primary-color` 等 `@*-color` 变量；TS/JS 主题配置统一使用 `aplusModifyVars['@primary-color']`，禁止直接写十六进制、rgba、渐变等色值。
- 设计页面时强制采用预设颜色体系：新页面、区块、弹窗、抽屉、状态色、边框、背景和文字颜色均从 `src/config/theme-color-token.ts` 的 `ThemeColor` 预设中选择；确需新增颜色时先补充到预设，再通过变量引用，不在页面代码中引入临时色值。
