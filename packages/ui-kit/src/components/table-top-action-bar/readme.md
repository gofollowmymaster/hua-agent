# TableTopActionBar

表格上方操作栏组件，基于 `ApBatchAction` 封装，统一承载批量操作栏、页面操作按钮和表格设置入口。

## Props

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `selectedRowKeys` | `(string \| number)[]` | 表格选中行 key。 |
| `clearAll` | `() => void` | 清空表格选中项。 |
| `settings` | `ApTableSettingType & { hidden?: boolean }` | 表格列设置配置，`hidden` 可隐藏设置入口。 |
| `refreshConfig` | `{ refresh: () => void; tooltip?: string; visible?: boolean }` | 可选刷新配置；不传时不显示刷新入口，`visible: false` 可隐藏。 |
| `showSelected` | `boolean` | 是否展示批量选中主体，默认 `true`。 |

## Slots

- `header`：操作栏左侧内容。
- `suffix`：批量操作栏主体内容；无内容时使用普通 flex 操作栏。
- `setting`：表格设置按钮左侧的自定义设置入口。

## 使用示例

```vue
<TableTopActionBar
  :selected-row-keys="selectedRowKeys"
  :clear-all="clearAll"
  :show-selected="false"
  :settings="{ persistenceKey: 'app_documents_document-manager-list' }"
  :refresh-config="{ refresh: reload }"
>
  <template #suffix>
    <ApButton type="primary">新增</ApButton>
  </template>
</TableTopActionBar>
```
