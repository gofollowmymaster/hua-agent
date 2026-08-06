import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resolverPath = path.join(scriptDir, "resolve-feishu-doc-metadata.mjs");

function epoch(iso) {
  return String(Date.parse(iso) / 1000);
}

function createFakeLarkCli(t) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fd-doc-metadata-test-"));
  const fakeCli = path.join(tempDir, "fake-lark-cli.mjs");
  fs.writeFileSync(
    fakeCli,
    `#!/usr/bin/env node
const scenario = JSON.parse(process.env.FAKE_LARK_SCENARIO || "{}");
const args = process.argv.slice(2);
const flag = (name) => args[args.indexOf(name) + 1];
const success = (data) => console.log(JSON.stringify({ ok: true, data }));
const failure = (message) => {
  console.log(JSON.stringify({ ok: false, error: { message } }));
  process.exit(1);
};

if (args[0] === "wiki" && args[1] === "spaces" && args[2] === "get_node") {
  const params = JSON.parse(flag("--params"));
  const key = params.obj_type ? params.obj_type + ":" + params.token : params.token;
  const node = scenario.wikiNodes?.[key];
  if (!node) failure("wiki node not found: " + key);
  success({ node });
} else if (args[0] === "drive" && args[1] === "+inspect") {
  if (!scenario.inspect) failure("inspect unavailable");
  success(scenario.inspect);
} else if (args[0] === "drive" && args[1] === "metas" && args[2] === "batch_query") {
  if (!scenario.driveMeta) failure("drive metadata unavailable");
  success({ metas: [scenario.driveMeta] });
} else {
  failure("unexpected command: " + args.join(" "));
}
`,
    "utf8",
  );
  fs.chmodSync(fakeCli, 0o755);
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));
  return fakeCli;
}

function runResolver(t, scenario, remote, extraArgs = []) {
  const fakeCli = createFakeLarkCli(t);
  return spawnSync(
    process.execPath,
    [resolverPath, "--remote", remote, ...extraArgs],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        LARK_CLI_BIN: fakeCli,
        FAKE_LARK_SCENARIO: JSON.stringify(scenario),
      },
    },
  );
}

test("resolves wiki IDs, Shanghai date, and full breadcrumb", (t) => {
  const scenario = {
    wikiNodes: {
      wikiTarget: {
        node_token: "wikiTarget",
        obj_token: "docTarget",
        obj_type: "docx",
        obj_edit_time: epoch("2026-01-13T16:01:00Z"),
        parent_node_token: "wikiParent",
        space_id: "space1",
        title: "目标文档",
      },
      wikiParent: {
        node_token: "wikiParent",
        parent_node_token: "wikiRoot",
        space_id: "space1",
        title: "父级",
      },
      wikiRoot: {
        node_token: "wikiRoot",
        parent_node_token: "",
        space_id: "space1",
        title: "根目录",
      },
    },
  };

  const result = runResolver(
    t,
    scenario,
    "https://example.feishu.cn/wiki/wikiTarget",
  );
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    remote: "https://example.feishu.cn/wiki/wikiTarget",
    documentId: "docTarget",
    wikiNodeId: "wikiTarget",
    lastModifiedDate: "2026-01-14",
    breadcrumb: ["根目录", "父级", "目标文档"],
    title: "目标文档",
  });
});

test("resolves direct document with an associated wiki node", (t) => {
  const scenario = {
    inspect: { token: "doc1", type: "docx", title: "Drive 标题" },
    driveMeta: {
      title: "Drive 标题",
      latest_modify_time: epoch("2026-02-02T01:00:00Z"),
    },
    wikiNodes: {
      "docx:doc1": {
        node_token: "wikiDoc",
        obj_token: "doc1",
        parent_node_token: "wikiRoot",
        space_id: "space1",
        title: "Wiki 标题",
      },
      wikiRoot: {
        node_token: "wikiRoot",
        parent_node_token: "",
        space_id: "space1",
        title: "知识库",
      },
    },
  };

  const result = runResolver(
    t,
    scenario,
    "https://example.feishu.cn/docx/doc1",
  );
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    remote: "https://example.feishu.cn/docx/doc1",
    documentId: "doc1",
    wikiNodeId: "wikiDoc",
    lastModifiedDate: "2026-02-02",
    breadcrumb: ["知识库", "Wiki 标题"],
    title: "Wiki 标题",
  });
});

test("falls back to a single title for a direct non-wiki document", (t) => {
  const scenario = {
    inspect: { token: "doc2", type: "docx", title: "普通文档" },
    driveMeta: {
      title: "普通文档",
      latest_modify_time: epoch("2026-03-03T08:00:00Z"),
    },
    wikiNodes: {},
  };

  const result = runResolver(
    t,
    scenario,
    "https://example.feishu.cn/docx/doc2",
  );
  assert.equal(result.status, 0, result.stderr);
  const metadata = JSON.parse(result.stdout);
  assert.equal(metadata.wikiNodeId, "未关联");
  assert.deepEqual(metadata.breadcrumb, ["普通文档"]);
});

test("fails when the real last modified time is unavailable", (t) => {
  const scenario = {
    wikiNodes: {
      wikiTarget: {
        node_token: "wikiTarget",
        obj_token: "docTarget",
        parent_node_token: "",
        space_id: "space1",
        title: "目标文档",
      },
    },
  };
  const result = runResolver(
    t,
    scenario,
    "https://example.feishu.cn/wiki/wikiTarget",
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /最后修改时间/);
});

test("fails on a cyclic wiki parent chain", (t) => {
  const scenario = {
    wikiNodes: {
      wikiTarget: {
        node_token: "wikiTarget",
        obj_token: "docTarget",
        obj_edit_time: epoch("2026-01-01T00:00:00Z"),
        parent_node_token: "wikiParent",
        space_id: "space1",
        title: "目标文档",
      },
      wikiParent: {
        node_token: "wikiParent",
        parent_node_token: "wikiTarget",
        space_id: "space1",
        title: "父级",
      },
    },
  };
  const result = runResolver(
    t,
    scenario,
    "https://example.feishu.cn/wiki/wikiTarget",
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /存在循环/);
});

test("fails when a wiki parent node cannot be resolved", (t) => {
  const scenario = {
    wikiNodes: {
      wikiTarget: {
        node_token: "wikiTarget",
        obj_token: "docTarget",
        obj_edit_time: epoch("2026-01-01T00:00:00Z"),
        parent_node_token: "missingParent",
        space_id: "space1",
        title: "目标文档",
      },
    },
  };
  const result = runResolver(
    t,
    scenario,
    "https://example.feishu.cn/wiki/wikiTarget",
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /wiki node not found: missingParent/);
});
