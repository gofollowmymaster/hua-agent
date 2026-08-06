#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const title = args.title || "未命名飞书文档";
const remote = args.remote || "";
const snapshotAt = args["snapshot-at"] || new Date().toISOString().slice(0, 10);
const sourceCommand =
  args["source-command"] ||
  'lark-cli docs +fetch --as user --doc "<remote>" --jq ".data.markdown"';
const outputPath = args.output ? path.resolve(args.output) : "";
const assetsDir =
  args["assets-dir"] ||
  (outputPath ? path.join(path.dirname(outputPath), "assets") : "");
const downloadWhiteboards = args["download-whiteboards"] === "true";
const mindnoteMap = loadMindnoteMap(args["mindnote-map"]);
const allowUnresolvedMindnotes = args["allow-unresolved-mindnotes"] === "true";
const kind = args.kind || "";
const workItem = args["work-item"] || "";
const teamInfo = args["team-info"] || "";

const input = args.input
  ? fs.readFileSync(args.input, "utf8")
  : fs.readFileSync(0, "utf8");

const output = normalizeDocument(input, {
  title,
  remote,
  snapshotAt,
  sourceCommand,
  assetsDir,
  outputPath,
  downloadWhiteboards,
  mindnoteMap,
  allowUnresolvedMindnotes,
  kind,
  workItem,
  teamInfo,
});

if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output, "utf8");
} else {
  process.stdout.write(output);
}

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      result[key] = "true";
    } else {
      result[key] = next;
      i += 1;
    }
  }
  return result;
}

function loadMindnoteMap(filePath) {
  if (!filePath) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function normalizeDocument(markdown, meta) {
  let body = markdown.replace(/\r\n/g, "\n");
  const mindnoteBlocks = [];
  body = stripExistingSnapshotHeader(body);
  body = normalizeBlockAssets(body, meta, mindnoteBlocks);
  body = body.replace(/<lark-table\b[^>]*>[\s\S]*?<\/lark-table>/g, tableToMarkdown);
  body = body.replace(/<table\b[^>]*>[\s\S]*?<\/table>/g, tableToMarkdown);
  body = cleanInline(body);
  body = restoreMindnoteBlocks(body, mindnoteBlocks);
  body = normalizeHeadingLevels(body);
  body = normalizeWhitespace(body);

  const kindLabel = meta.kind === "test" ? "测分"
    : meta.kind === "backend" ? "后端系分"
    : meta.kind === "prd" ? "PRD"
    : "飞书文档";

  const docInfoRows = [
    `| 远程文档 | ${meta.remote || "未记录"} |`,
  ];

  if (meta.workItem) {
    docInfoRows.push(`| 飞书项目工作项 | ${meta.workItem} |`);
  }

  docInfoRows.push(
    `| 快照时间 | ${meta.snapshotAt} |`,
    `| 来源命令 | \`${escapeTableCell(meta.sourceCommand)}\` |`,
    `| 格式处理 | fd-doc-markdown-sync/scripts/normalize-feishu-doc-markdown.mjs |`,
  );

  if (meta.kind === "prd" && meta.teamInfo) {
    docInfoRows.push(`| 人员 | ${escapeTableCell(meta.teamInfo)} |`);
  }

  return [
    `# ${kindLabel}：${meta.title}`,
    "",
    "## 文档信息",
    "",
    "| 项 | 内容 |",
    "| --- | --- |",
    ...docInfoRows,
    "",
    "---",
    "",
    body,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trimEnd() + "\n";
}

function stripExistingSnapshotHeader(markdown) {
  return markdown
    .replace(/^#\s+(飞书文档|文档快照|PRD 快照|PRD|测分|后端系分)[^\n]*\n(?:\n|.)*?\n---\n+/, "")
    .replace(/^#\s+(飞书文档|文档快照|PRD 快照|PRD|测分|后端系分)[^\n]*\n+/, "");
}

function normalizeBlockAssets(markdown, meta, mindnoteBlocks) {
  let out = markdown;
  out = out.replace(/<view[^>]*>\s*<file\s+([^>]*?)\/>\s*<\/view>/g, (_, attrs) => {
    const name = attr(attrs, "name") || "未命名附件";
    const token = attr(attrs, "token") || "unknown";
    return `\n\n> 附件：${name}，token=\`${token}\`。如需查看请使用 lark-doc media-download。\n\n`;
  });
  out = out.replace(/<image\s+([^>]*?)\/>/g, (_, attrs, offset) => {
    const token = attr(attrs, "token") || "unknown";
    const width = attr(attrs, "width");
    const height = attr(attrs, "height");
    const size = [width ? `width=${width}` : "", height ? `height=${height}` : ""]
      .filter(Boolean)
      .join("，");
    return `\n\n> 图片：${currentContextTitle(out, offset)}，token=\`${token}\`${size ? `，${size}` : ""}。远程素材未下载。\n\n`;
  });
  out = out.replace(/<img\s+([^>]*?)\/>/g, (_, attrs, offset) => {
    const token = attr(attrs, "token") || attr(attrs, "src") || "unknown";
    const width = attr(attrs, "width");
    const height = attr(attrs, "height");
    const alt = attr(attrs, "alt");
    const size = [width ? `width=${width}` : "", height ? `height=${height}` : ""]
      .filter(Boolean)
      .join("，");
    const caption = alt || currentContextTitle(out, offset);
    return `\n\n> 图片：${caption}，token=\`${token}\`${size ? `，${size}` : ""}。远程素材未下载。\n\n`;
  });
  out = out.replace(/<whiteboard\s+([^>]*?)(?:\/>|>\s*<\/whiteboard>)/g, (_, attrs, offset) => {
    const token = attr(attrs, "token") || "unknown";
    const title = currentContextTitle(out, offset);
    const assetPath = materializeWhiteboard(token, title, meta);
    if (assetPath) {
      return `\n\n![画板：${escapeImageAlt(title)}](${assetPath})\n\n> 画板来源：token=\`${token}\`\n\n`;
    }
    return `\n\n> 画板：${title}，token=\`${token}\`。缩略图未下载；可执行 \`lark-cli docs +media-download --type whiteboard --token ${token}\` 后改为 Markdown 图片引用。\n\n`;
  });
  out = out.replace(/<mindnote\s+([^>]*?)\/>/g, (_, attrs, offset) => {
    const token = attr(attrs, "token") || "unknown";
    const title = currentContextTitle(out, offset);
    const rendered = renderMindnote(token, title, meta);
    if (!rendered && meta.allowUnresolvedMindnotes) {
      return `\n\n> 思维导图：${title}，token=\`${token}\`。未提供树形结构数据。\n\n`;
    }
    if (!rendered) {
      throw new Error(
        `发现思维导图 token=${token}，但未在 --mindnote-map 中提供树形结构数据。请先读取思维导图全部节点并以树形 JSON/Markdown 提供，不能只保留 token 占位。`,
      );
    }
    const placeholder = `%%FEISHU_MINDNOTE_BLOCK_${mindnoteBlocks.length}%%`;
    mindnoteBlocks.push(rendered);
    return `\n\n${placeholder}\n\n`;
  });
  return out;
}

function restoreMindnoteBlocks(markdown, mindnoteBlocks) {
  let out = markdown;
  for (let index = 0; index < mindnoteBlocks.length; index += 1) {
    out = out.replace(`%%FEISHU_MINDNOTE_BLOCK_${index}%%`, mindnoteBlocks[index]);
  }
  return out;
}

function renderMindnote(token, contextTitle, meta) {
  const value = lookupMindnote(token, meta.mindnoteMap);
  if (value === undefined || value === null || value === "") return "";

  const renderedTree = mindnoteValueToMarkdown(value);
  if (!renderedTree.trim()) return "";

  const title = safeText(
    typeof value === "object" && !Array.isArray(value)
      ? value.title || value.name || value.text || contextTitle
      : contextTitle,
  );

  return [
    `**思维导图：${title || contextTitle}**`,
    "",
    `> 思维导图来源：token=\`${token}\``,
    "",
    renderedTree.trimEnd(),
  ].join("\n");
}

function lookupMindnote(token, mindnoteMap) {
  if (!mindnoteMap || typeof mindnoteMap !== "object") return undefined;
  if (Object.prototype.hasOwnProperty.call(mindnoteMap, token)) return mindnoteMap[token];
  if (Array.isArray(mindnoteMap)) {
    return mindnoteMap.find((item) => item?.token === token || item?.id === token);
  }
  if (Array.isArray(mindnoteMap.mindnotes)) {
    return mindnoteMap.mindnotes.find((item) => item?.token === token || item?.id === token);
  }
  return undefined;
}

function mindnoteValueToMarkdown(value) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return renderMindnoteNodes(value);
  if (!value || typeof value !== "object") return "";
  if (typeof value.markdown === "string") return value.markdown.trim();
  if (typeof value.tree === "string") return value.tree.trim();
  if (Array.isArray(value.tree)) return renderMindnoteNodes(value.tree);
  return renderMindnoteNodes([value]);
}

function renderMindnoteNodes(nodes, depth = 0) {
  return nodes
    .map((node) => renderMindnoteNode(node, depth))
    .filter(Boolean)
    .join("\n");
}

function renderMindnoteNode(node, depth) {
  if (node === undefined || node === null || node === "") return "";
  const children = getMindnoteChildren(node);
  const label = safeText(getMindnoteLabel(node) || (children.length ? "未命名节点" : ""));
  const lines = [];

  if (label) {
    lines.push(`${"  ".repeat(depth)}- ${label}`);
  }

  const childDepth = label ? depth + 1 : depth;
  const renderedChildren = renderMindnoteNodes(children, childDepth);
  if (renderedChildren) lines.push(renderedChildren);
  return lines.join("\n");
}

function getMindnoteLabel(node) {
  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return String(node);
  }
  if (!node || typeof node !== "object") return "";
  return node.title || node.text || node.name || node.content || node.value || node.label || "";
}

function getMindnoteChildren(node) {
  if (!node || typeof node !== "object") return [];
  const children =
    node.children ||
    node.childNodes ||
    node.child_nodes ||
    node.nodes ||
    node.items ||
    node.subNodes ||
    node.sub_nodes ||
    [];
  return Array.isArray(children) ? children : [];
}

function safeText(value) {
  return decodeHtmlEntities(String(value))
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function materializeWhiteboard(token, title, meta) {
  if (!meta.assetsDir || !token || token === "unknown") return "";

  const relativeDir = "whiteboards";
  const filename = `${slugify(`${title}-${token}`)}.png`;
  const absoluteDir = path.resolve(meta.assetsDir, relativeDir);
  const absolutePath = path.join(absoluteDir, filename);
  const relativePath = meta.outputPath
    ? toPosixRelative(path.dirname(meta.outputPath), absolutePath)
    : path.posix.join("assets", relativeDir, filename);

  if (fs.existsSync(absolutePath)) return relativePath;
  if (!meta.downloadWhiteboards) return "";

  fs.mkdirSync(absoluteDir, { recursive: true });
  try {
    execFileSync(
      "lark-cli",
      ["docs", "+media-download", "--type", "whiteboard", "--token", token, "--output", filename],
      { cwd: absoluteDir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    return fs.existsSync(absolutePath) ? relativePath : "";
  } catch {
    return "";
  }
}

function currentContextTitle(markdown, offset) {
  const before = markdown.slice(0, offset);
  const headings = [...before.matchAll(/^#{1,6}\s+(.+)$/gm)];
  if (!headings.length) return "未命名上下文";
  return cleanInline(headings.at(-1)[1]).replace(/\|/g, "/") || "未命名上下文";
}

function tableToMarkdown(table) {
  const tableAttrs = table.match(/^<lark-table\b([^>]*)>/)?.[1] || "";
  const sourceRows = [...table.matchAll(/<(?:lark-)?tr[^>]*>([\s\S]*?)<\/(?:lark-)?tr>/g)].map((row) =>
    [...row[1].matchAll(/<(?:lark-)?(?:td|th)([^>]*)>([\s\S]*?)<\/(?:lark-)?(?:td|th)>/g)].map((cell) => ({
      attrs: cell[1],
      text: normalizeCellText(cell[2]),
      rowspan: toPositiveInt(attr(cell[1], "rowspan"), 1),
      colspan: toPositiveInt(attr(cell[1], "colspan"), 1),
    })),
  );

  if (!sourceRows.length) return "";

  const width = Math.max(
    toPositiveInt(attr(tableAttrs, "cols"), 0),
    ...sourceRows.map((row) => row.reduce((sum, cell) => sum + cell.colspan, 0)),
  );
  const grid = expandTableGrid(sourceRows, width);
  const headerRow = attr(tableAttrs, "header-row") === "true" || looksLikeHeader(grid[0]);
  const rows = headerRow ? grid : [makeGeneratedHeader(width), ...grid];
  const escapedRows = rows.map((row) => row.map((cell) => escapeTableCell(cell || " ")));
  const lines = [];

  if (width > 8) {
    lines.push("", "> 宽表：建议横向查看。");
  }

  lines.push("");
  lines.push(`| ${escapedRows[0].join(" | ")} |`);
  lines.push(`| ${Array(width).fill("---").join(" | ")} |`);
  for (const row of escapedRows.slice(1)) {
    lines.push(`| ${row.join(" | ")} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function expandTableGrid(sourceRows, width) {
  const grid = [];
  const spans = [];

  for (let rowIndex = 0; rowIndex < sourceRows.length; rowIndex += 1) {
    const row = Array(width).fill("");
    grid.push(row);

    for (let col = 0; col < width; col += 1) {
      if (spans[col]?.remaining > 0) {
        row[col] = spans[col].text;
        spans[col].remaining -= 1;
      }
    }

    let col = 0;
    for (const cell of sourceRows[rowIndex]) {
      while (col < width && row[col]) col += 1;
      for (let offset = 0; offset < cell.colspan && col + offset < width; offset += 1) {
        row[col + offset] = offset === 0 ? cell.text : "";
        if (cell.rowspan > 1) {
          spans[col + offset] = {
            text: offset === 0 ? cell.text : "",
            remaining: cell.rowspan - 1,
          };
        }
      }
      col += cell.colspan;
    }
  }

  return grid;
}

function looksLikeHeader(row) {
  if (!row?.length) return false;
  const filled = row.filter((cell) => cell.trim()).length;
  if (filled < Math.max(1, row.length - 1)) return false;
  const joined = row.join(" ");
  return /字段|说明|序号|时间|版本|变更|功能|平台|页面|接口|角色|状态|类型|名称|内容|模块/.test(joined);
}

function makeGeneratedHeader(width) {
  return Array.from({ length: width }, (_, index) => `列${index + 1}`);
}

function normalizeCellText(text) {
  return normalizeHierarchicalLines(htmlBlockTextToLines(text))
    .filter(Boolean)
    .join("<br>");
}

function htmlBlockTextToLines(text) {
  const input = String(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "");
  const parts = input.match(/<[^>]+>|[^<]+/g) || [];
  const counters = [];
  let level = -1;
  let output = "";

  for (const part of parts) {
    if (!part.startsWith("<")) {
      output += decodeHtmlEntities(part);
      continue;
    }

    const tag = part.toLowerCase();
    if (/^<ol\b/.test(tag)) {
      level += 1;
      counters[level] = 0;
      output = ensureTrailingNewline(output);
      continue;
    }
    if (/^<\/ol\b/.test(tag)) {
      level = Math.max(-1, level - 1);
      output = ensureTrailingNewline(output);
      continue;
    }
    if (/^<li\b/.test(tag)) {
      const currentLevel = Math.max(0, level);
      counters[currentLevel] = (counters[currentLevel] || 0) + 1;
      counters.length = currentLevel + 1;
      output = `${ensureTrailingNewline(output)}${"  ".repeat(currentLevel)}${counters[currentLevel]}. `;
      continue;
    }
    if (/^<\/li\b/.test(tag)) {
      output = ensureTrailingNewline(output);
      continue;
    }
    if (/^<blockquote\b/.test(tag)) {
      output = `${ensureTrailingNewline(output)}> `;
      continue;
    }
    if (/^<\/blockquote\b/.test(tag)) {
      output = ensureTrailingNewline(output);
      continue;
    }
    if (/^<(?:div|section|article|h[1-6])\b/.test(tag) || /^<\/(?:div|section|article|h[1-6])\b/.test(tag)) {
      output = ensureTrailingNewline(output);
    }
  }

  return output;
}

function ensureTrailingNewline(value) {
  if (!value || value.endsWith("\n")) return value;
  return `${value}\n`;
}

function normalizeHierarchicalLines(text) {
  const rawLines = decodeHtmlEntities(String(text)).replace(/\r\n/g, "\n").split("\n");
  const indentStack = [];
  const counters = [];

  return rawLines.map((rawLine) => {
    const parsed = parseListLine(rawLine);
    if (!parsed) return cleanInline(rawLine);

    const level = resolveIndentLevel(indentStack, parsed.indent);
    counters[level] = (counters[level] || 0) + 1;
    counters.length = level + 1;
    const visualIndent = level > 0 ? `${"&nbsp;".repeat(level * 4)}` : "";
    return `${visualIndent}${formatListMarker(level, counters[level], parsed.marker)} ${cleanInline(parsed.content)}`;
  });
}

function resolveIndentLevel(indentStack, indent) {
  if (!indentStack.length) {
    indentStack.push(indent);
    return 0;
  }

  while (indentStack.length && indentStack.at(-1) > indent) {
    indentStack.pop();
  }

  if (indentStack.at(-1) !== indent) {
    indentStack.push(indent);
  }

  return Math.max(0, indentStack.length - 1);
}

function parseListLine(line) {
  const match = line.match(/^([ \t]*)(\d+\.|[a-zA-Z]\.|[ivxlcdmIVXLCDM]+\.)\s+([\s\S]*?)\s*$/);
  if (!match) return null;
  return {
    indent: match[1].replace(/\t/g, "    ").length,
    marker: match[2],
    content: match[3],
  };
}

function formatListMarker(level, index, originalMarker) {
  if (/^[a-zA-Z]\.$/.test(originalMarker) || /^[ivxlcdmIVXLCDM]+\.$/.test(originalMarker)) {
    return originalMarker.toLowerCase();
  }

  switch (level % 3) {
    case 1:
      return `${toAlpha(index)}.`;
    case 2:
      return `${toRoman(index)}.`;
    default:
      return `${index}.`;
  }
}

function toAlpha(index) {
  let n = index;
  let result = "";
  while (n > 0) {
    n -= 1;
    result = String.fromCharCode(97 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result || "a";
}

function toRoman(index) {
  const values = [
    [1000, "m"],
    [900, "cm"],
    [500, "d"],
    [400, "cd"],
    [100, "c"],
    [90, "xc"],
    [50, "l"],
    [40, "xl"],
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];
  let n = Math.max(1, index);
  let result = "";
  for (const [value, symbol] of values) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}

function cleanInline(text) {
  return decodeHtmlEntities(String(text))
    .replace(/<br\s*\/?>/gi, "%%FEISHU_DOC_SYNC_BR%%")
    .replace(/\s*\{[^}]*="[^"]*"[^}]*\}/g, "")
    .replace(/\{align="[^"]*"\}/g, "")
    .replace(/<mention-user\s+id="([^"]+)"\s*\/?>/g, "@用户(id=$1)")
    .replace(/<mention-doc\s+token="([^"]+)"[^>]*>([\s\S]*?)<\/mention-doc>/g, (_, token, body) => {
      const label = cleanInline(body) || "未命名文档";
      return `文档引用：${label}(token=${token})`;
    })
    .replace(/<text\s+[^>]*>([\s\S]*?)<\/text>/g, "$1")
    .replace(/<quote-container>([\s\S]*?)<\/quote-container>/g, (_, body) =>
      cleanInline(body)
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n"),
    )
    .replace(/<task\s+task-id="([^"]+)"[^>]*><\/task>/g, "任务引用：task-id=$1")
    .replace(/\[([^\]]*)\]\((https?%3A[^)]*)\)/g, (_, label, url) => `[${label}](${safeDecodeURIComponent(url)})`)
    .replace(/<\/?[^>]+>/g, "")
    .replace(/%%FEISHU_DOC_SYNC_BR%%/g, "<br>")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function normalizeHeadingLevels(markdown) {
  const lines = markdown.split("\n");
  const normalized = [];

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!heading) {
      normalized.push(line);
      continue;
    }

    const text = cleanInline(heading[2]);
    if (!text) continue;

    const nextLevel = Math.min(6, heading[1].length + 1);
    if (normalized.length && normalized.at(-1) !== "") normalized.push("");
    normalized.push(`${"#".repeat(nextLevel)} ${text}`);
    normalized.push("");
  }

  return normalized.join("\n");
}

function normalizeWhitespace(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n(\| .+ \|)\n(?!\|)/g, "\n$1\n\n")
    .trim();
}

function attr(attrs, name) {
  return attrs.match(new RegExp(`${name}="([^"]*)"`))?.[1] || "";
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function escapeTableCell(value) {
  return String(value)
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return String(value)
    .trim()
    .replace(/[\\/:*?"<>|#%&{}$!'@+`=]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120) || "whiteboard";
}

function escapeImageAlt(value) {
  return String(value).replace(/[\[\]\n\r]/g, " ").trim() || "画板";
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toPosixRelative(fromDir, targetPath) {
  const relative = path.relative(fromDir, targetPath).split(path.sep).join(path.posix.sep);
  return relative.startsWith(".") ? relative : `./${relative}`;
}
