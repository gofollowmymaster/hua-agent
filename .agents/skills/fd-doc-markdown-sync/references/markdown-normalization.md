# Markdown 友好化规则

将飞书文档转换为适合 AI 和人工阅读的 Markdown。最终文档由 `scripts/normalize-feishu-doc-markdown.mjs` 生成；如果脚本规则与本文不一致，优先修脚本，不要临时手写转换逻辑。

## 文档结构

- 第一行格式由 `--kind` 参数控制：
  - 不传 `--kind`：`# 飞书文档：{标题}`
  - `--kind prd`：`# PRD：{标题}`
  - `--kind test`：`# 测分：{标题}`
  - `--kind backend`：`# 后端系分：{标题}`
- 顶部使用 `## 文档信息`，用 Markdown 表格记录。
  - 基础行：`远程文档`、`快照时间`、`来源命令`、`格式处理`。
  - 如果传了 `--work-item`，追加 `| 飞书项目工作项 | {workItem} |` 行。
  - 如果传了 `--kind prd` 且传了 `--team-info`，追加 `| 人员 | {teamInfo} |` 行。
- 原始正文标题整体下移一级，避免多个一级标题并列。
- 每个标题前后保留空行，删除连续空标题和空章节。

## 表格

- 所有 `<lark-table>` 必须转为 GitHub Flavored Markdown 表格。
- 所有 `<table>` HTML 标签同样转为 GFM 表格。
- 最终正文中不得保留原始 `<lark-table>`、`<lark-tr>`、`<lark-td>`、`<tr>`、`<td>`。
- `rowspan` 向下复制单元格内容。
- `colspan` 按列宽展开，首列保留内容，其余列补空。
- `header-row="true"` 时第一行作为表头；否则如果第一行像字段名，也作为表头；否则生成 `列1`、`列2`、`列3`。
- 单元格中的多段内容用 `<br>` 连接；编号列表保留为 `1. ...<br>2. ...`。
- 多层有序列表必须保留原始缩进层级。表格单元格内不能可靠渲染原生 Markdown 嵌套列表时，用 `&nbsp;` 表达缩进。
- 宽表超过 8 列时仍保留为 Markdown 表格，并在表格前添加 `> 宽表：建议横向查看。`。
- 清理 `{align="center"}`、`column-widths`、空白标签等飞书样式信息。

## 图片、画板、思维导图、附件

- 文档中的 Markdown 图片 `![alt](url)` 默认保持云端链接。
- `<image token="..." src="..." width="..." height="..." />` 默认转为云端 Markdown 图片引用；只有 token 且无 src 时保留 token 占位，并保留 width、height。
- `<img token="..." src="..." width="..." height="..." />` 默认同样转为云端 Markdown 图片引用；优先使用 `alt` 属性作为标题，然后回退为上下文标题。
- 传 `--download-images true` 时，Markdown 图片、`<image>`、`<img>` 会下载到输出文件旁的 `assets/images/` 并替换为本地相对路径；下载失败自动回退云端链接或 token 占位。
- `<whiteboard token="..." />` 自动优先调用 `lark-cli whiteboard +query --output_as code` 导出 Mermaid；成功时输出 ` ```mermaid ... ``` ` 代码块并保留来源 token。
- Mermaid 不可用或画板内不是单一 Mermaid 图时，自动保存截图到输出文件旁的 `assets/whiteboards/` 并转为 Markdown 图片引用；截图也失败时保留 token 占位。
- `<mindnote token="..." />` 必须展开为树形分层 Markdown 列表，保留来源 token。
- 思维导图节点结构由 `--mindnote-map` 提供。脚本支持 JSON 节点树或已渲染的 Markdown 树：

  ```json
  {
    "mindnote_token": {
      "title": "思维导图标题",
      "children": [
        {
          "title": "一级节点",
          "children": [
            { "title": "二级节点" }
          ]
        }
      ]
    }
  }
  ```

  或：

  ```json
  {
    "mindnote_token": {
      "title": "思维导图标题",
      "markdown": "- 一级节点\n  - 二级节点"
    }
  }
  ```

- 如果发现 `<mindnote>` 但未提供树形结构数据，脚本默认失败。不要输出只有 token 的思维导图占位；思维导图的信息价值在层级文本。
- `<view><file ... /></view>` 转为附件占位，保留文件名和 token。
- 不删除 token；后续 Agent 需要 token 继续追溯素材。

## mention、任务、链接

- `<mention-user .../>` 转换为 `@用户(id=...)`。
- `<mention-doc ...>` 转换为 `文档引用：标题(token=...)`。
- `<task task-id="...">` 转换为 `任务引用：task-id=...`。
- URL 编码链接必须尽量解码为正常 Markdown 链接。

## 清理与验收

- 删除行尾空格。
- 压缩 3 个以上连续空行为 2 个空行。
- 同步后执行：

  ```bash
  rg "<lark-table|<image|<whiteboard|<mindnote|<view|<mention-user|<mention-doc|<text|<quote-container" "<target.md>"
  rg "\\{align=|column-widths=|rowspan=|colspan=" "<target.md>"
  git diff --check -- "<target.md>"
  ```
