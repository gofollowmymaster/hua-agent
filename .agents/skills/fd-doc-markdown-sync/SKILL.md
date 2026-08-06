---
name: fd-doc-markdown-sync
description: 将单个飞书云文档、知识库文档链接或文档 token 拉取并保存为本地 Markdown 文件，保留标题、来源、快照时间，并将飞书表格、图片、附件、画板、思维导图、mention 等原始标签整理为适合 AI 和人工阅读的 Markdown；思维导图必须展开为树形分层文本，不能只保留 token 占位。适用于将飞书文档同步为本地 md 文件的场景。
---

# Feishu Doc Markdown Sync

将飞书文档同步为本地 Markdown 文件。输出路径由调用方显式指定，本 skill 只负责文档拉取、转换和规范化。

## 必须配合

- `lark-shared`：认证、身份、权限处理。
- `lark-doc`：读取飞书文档、下载图片/文件/画板素材。
- `lark-drive`：inspect 文档类型、处理独立思维导图对象；当文档中出现 `<mindnote token="..."/>` 时用于进一步追溯。
- `lark-wiki`：当输入是 `/wiki/` 链接且需要确认真实文档类型时使用。

## 输出目标

输出路径由调用方（用户或上层 skill）显式指定，本 skill 不做默认路径推断。调用时必须提供 `--output` 参数指定目标文件路径。

## 执行流程

1. **确认输入与输出**
   - 从用户消息中提取飞书文档 URL 或 token。
   - 输出路径由调用方指定；如果用户或上层 skill 未提供，必须要求明确输出路径后再继续。
   - 如果目标文件已存在，先说明将覆盖；用户明确要求"更新/覆盖/重新同步"时可直接覆盖。

2. **读取文档**
   - 优先使用：

     ```bash
     lark-cli docs +fetch --as user --doc "<url-or-token>" --jq ".data"
     ```

   - 如果只需要正文，也可使用：

     ```bash
     lark-cli docs +fetch --as user --doc "<url-or-token>" --jq ".data.markdown"
     ```

   - 尽量获取标题；若 `.data.title` 不存在，用用户给出的标题、URL token 或“未命名飞书文档”。
   - 如果是 `/wiki/` 链接且 fetch 报类型或权限问题，按 `lark-doc` / `lark-wiki` 规则解析真实 `obj_type` 和 `obj_token`；`docx` / `doc` 类型继续转 Markdown。
   - 如果真实类型是 `mindnote`，不要按普通文档 fetch；必须读取完整思维导图结构并保存为树形 Markdown，见下一步。

3. **处理思维导图**
   - 如果原始 Markdown 中包含 `<mindnote token="..."/>`，必须为每个 token 获取完整树形结构；不能只保留 token 占位。
   - 优先使用当前 lark-cli / OpenAPI 可用能力读取 mindnote 节点。读取后生成 `mindnote-map.json`，结构可为：

     ```json
     {
       "mindnote_token": {
         "title": "思维导图标题",
         "children": [
           {
             "title": "一级节点",
             "children": [{ "title": "二级节点" }]
           }
         ]
       }
     }
     ```

   - 如果只拿到 Markdown 树，也可以写：

     ```json
     {
       "mindnote_token": {
         "title": "思维导图标题",
         "markdown": "- 一级节点\n  - 二级节点"
       }
     }
     ```

   - 如果无法读取思维导图节点，停止同步并说明“缺少 mindnote 树形结构读取能力或权限”；不要输出只有 token 的最终 Markdown。

4. **规范化 Markdown**
   - 使用本 skill 脚本生成最终文件，不要手写头部或自行拼接大段转换逻辑：

     ```bash
     node .agents/skills/fd-doc-markdown-sync/scripts/normalize-feishu-doc-markdown.mjs \
       --title "<文档标题>" \
       --remote "<飞书文档链接或 token>" \
       --snapshot-at "<YYYY-MM-DD>" \
       --assets-dir "<输出文件所在目录>/assets" \
       --download-whiteboards true \
       --mindnote-map "<mindnote-map.json>" \
       --input "<raw.md>" \
       --output "<target.md>"
     ```

   - 也可以通过 stdin 输入原始 Markdown，省略 `--input`。
   - 如果不希望下载画板缩略图，使用 `--download-whiteboards false`。
   - 如果文档没有思维导图，可以省略 `--mindnote-map`。
   - 如果需要生成需求包文档（PRD/测分/后端系分）格式的头部，可使用：
     - `--kind prd`：生成 `# PRD：{标题}` 头部，配合 `--team-info` 可在文档信息表格中追加人员信息行。
     - `--kind test`：生成 `# 测分：{标题}` 头部。
     - `--kind backend`：生成 `# 后端系分：{标题}` 头部。
     - 不传 `--kind`：保持默认 `# 飞书文档：{标题}` 头部。
   - 如果需要关联飞书项目工作项，传入 `--work-item "<工作项链接>"`，会在文档信息表格中追加 `| 飞书项目工作项 | ... |` 行。
   - 如果需要在 PRD 文档中标注人员信息，传入 `--team-info "<产品：{姓名} / 测试：{姓名} / 后端：{姓名}>"`（仅当 `--kind prd` 时生效）。
   - 图片和附件默认保留可追溯 token 占位；画板在可下载时保存到 `assets/whiteboards/` 并写成 Markdown 图片引用；思维导图必须展开为树形分层文本。
   - 转换细节见 `references/markdown-normalization.md`。

5. **验收**
   - 检查目标文件存在且非空。
   - 对目标文件执行：

     ```bash
     rg "<lark-table|<image|<img|<whiteboard|<mindnote|<view|<mention-user|<mention-doc|<text|<quote-container" "<target.md>"
     rg "\\{align=|column-widths=|rowspan=|colspan=" "<target.md>"
     git diff --check -- "<target.md>"
     ```

   - 前两条应无结果；如果仅残留业务正文中的尖括号文本，需要人工判断后说明。

6. **回报结果**
   - 输出本地 Markdown 路径。
   - 输出素材目录路径，若无素材则说明未生成。
   - 说明跳过或失败原因，例如权限不足、链接不是云文档、文档为空、画板缩略图下载失败、思维导图节点读取失败。
   - 如果发现 lark-cli 更新提示，完成当前任务后提醒用户。

## 禁止事项

- 不要把 `<lark-table>`、`<image>`、`<whiteboard>`、`<mindnote>`、`<view>` 等飞书原始标签原样留在最终 Markdown。
- 不要把思维导图降级为 token 占位；必须树形展开所有可读取节点。
- 不要删除媒体 token；后续仍可能需要用 token 追溯或下载素材。
- 不要在未指定输出路径时自行推断或生成默认路径。
