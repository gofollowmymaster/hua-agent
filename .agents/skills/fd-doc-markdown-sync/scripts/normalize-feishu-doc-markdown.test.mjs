import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const normalizerPath = path.join(scriptDir, "normalize-feishu-doc-markdown.mjs");
const baseMetadata = {
  remote: "https://example.feishu.cn/wiki/wikiTarget",
  documentId: "docTarget",
  wikiNodeId: "wikiTarget",
  lastModifiedDate: "2026-01-14",
  breadcrumb: ["根目录", "父级", "目标文档"],
  title: "目标文档",
};

function runNormalizer(t, { metadata = baseMetadata, input = "正文", args = [] } = {}) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fd-doc-normalize-test-"));
  const metadataPath = path.join(tempDir, "metadata.json");
  fs.writeFileSync(metadataPath, JSON.stringify(metadata), "utf8");
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));
  return spawnSync(
    process.execPath,
    [normalizerPath, "--metadata", metadataPath, ...args],
    { encoding: "utf8", input },
  );
}

test("renders exactly five YAML metadata fields", (t) => {
  const result = runNormalizer(t, { input: "# 正文章节\n\n正文" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /^---\n远程文档: "https:\/\/example\.feishu\.cn\/wiki\/wikiTarget"\n文档ID: "docTarget"\nWiki节点ID: "wikiTarget"\n最后修改时间: "2026-01-14"\n文档路径面包屑: "根目录 > 父级 > 目标文档"\n---\n\n# 飞书文档：目标文档\n/,
  );
  assert.match(result.stdout, /\n## 正文章节\n/);
  assert.doesNotMatch(result.stdout, /## 文档信息|快照时间|来源命令|格式处理/);
});

test("keeps all supported document title kinds", (t) => {
  const cases = [
    [[], "# 飞书文档：目标文档"],
    [["--kind", "prd"], "# PRD：目标文档"],
    [["--kind", "test"], "# 测分：目标文档"],
    [["--kind", "backend"], "# 后端系分：目标文档"],
  ];
  for (const [args, heading] of cases) {
    const result = runNormalizer(t, { args });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, new RegExp(`^${escapeRegExp(heading)}$`, "m"));
  }
});

test("strips the legacy document information table", (t) => {
  const input = `# 飞书文档：旧标题

## 文档信息

| 项 | 内容 |
| --- | --- |
| 远程文档 | https://old.example |
| 快照时间 | 2025-01-01 |

---

# 正文章节

正文`;
  const result = runNormalizer(t, { input });
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stdout, /旧标题|https:\/\/old\.example|快照时间/);
  assert.match(result.stdout, /\n## 正文章节\n/);
});

test("strips an existing generated YAML header", (t) => {
  const input = `---
远程文档: "https://old.example"
文档ID: "oldDoc"
Wiki节点ID: "oldWiki"
最后修改时间: "2025-01-01"
文档路径面包屑: "旧 > 路径"
---

# 飞书文档：旧标题

# 正文章节

正文`;
  const result = runNormalizer(t, { input });
  assert.equal(result.status, 0, result.stderr);
  assert.equal((result.stdout.match(/^---$/gm) || []).length, 2);
  assert.doesNotMatch(result.stdout, /oldDoc|旧标题|旧 > 路径/);
  assert.match(result.stdout, /\n## 正文章节\n/);
});

test("requires valid structured metadata", (t) => {
  const result = runNormalizer(t, {
    metadata: { ...baseMetadata, lastModifiedDate: "2026/01/14" },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /YYYY-MM-DD/);
});

test("rejects a nonexistent calendar date", (t) => {
  const result = runNormalizer(t, {
    metadata: { ...baseMetadata, lastModifiedDate: "2026-02-30" },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /有效的 YYYY-MM-DD 日期/);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
