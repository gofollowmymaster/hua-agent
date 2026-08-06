#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const remote = args.remote || "";
const identity = args.as || "user";
const explicitType = args.type || "";
const outputPath = args.output || "";
const larkCli = process.env.LARK_CLI_BIN || "lark-cli";

if (!remote) {
  throw new Error("必须通过 --remote 提供飞书文档 URL 或 token。");
}

const metadata = resolveMetadata({ remote, identity, explicitType, larkCli });
const serialized = `${JSON.stringify(metadata, null, 2)}\n`;

if (outputPath) {
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.writeFileSync(outputPath, serialized, "utf8");
} else {
  process.stdout.write(serialized);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      result[key] = "true";
    } else {
      result[key] = next;
      index += 1;
    }
  }
  return result;
}

function resolveMetadata({ remote, identity, explicitType, larkCli }) {
  const wikiToken = extractWikiToken(remote, explicitType);
  if (wikiToken) {
    const node = getWikiNode({ token: wikiToken, identity, larkCli });
    return metadataFromWikiNode(remote, node, identity, larkCli);
  }

  if (isBareToken(remote) && !explicitType) {
    const wikiNode = tryGetWikiNode({ token: remote, identity, larkCli });
    if (wikiNode) {
      return metadataFromWikiNode(remote, wikiNode, identity, larkCli);
    }
    throw new Error("裸 token 无法识别为 Wiki 节点；请通过 --type 指定文档类型。");
  }

  const inspected = inspectDocument({ remote, explicitType, identity, larkCli });
  const documentId = inspected.token;
  const documentType = inspected.type;
  if (!documentId || !documentType) {
    throw new Error("drive +inspect 未返回文档 ID 或文档类型。");
  }

  const driveMeta = getDriveMetadata({
    token: documentId,
    type: documentType,
    identity,
    larkCli,
  });
  const title = driveMeta.title || inspected.title || documentId;
  const wikiNode = tryGetWikiNode({
    token: documentId,
    objType: documentType,
    identity,
    larkCli,
  });

  return {
    remote,
    documentId,
    wikiNodeId: wikiNode?.node_token || "未关联",
    lastModifiedDate: formatShanghaiDate(driveMeta.latest_modify_time),
    breadcrumb: wikiNode
      ? resolveWikiBreadcrumb(wikiNode, identity, larkCli)
      : [title],
    title: wikiNode?.title || title,
  };
}

function metadataFromWikiNode(remote, node, identity, larkCli) {
  if (!node.obj_token) {
    throw new Error("Wiki 节点未返回底层文档 ID。");
  }
  return {
    remote,
    documentId: node.obj_token,
    wikiNodeId: node.node_token,
    lastModifiedDate: formatShanghaiDate(node.obj_edit_time),
    breadcrumb: resolveWikiBreadcrumb(node, identity, larkCli),
    title: node.title || node.obj_token,
  };
}

function resolveWikiBreadcrumb(targetNode, identity, larkCli) {
  const titles = [requiredNodeTitle(targetNode)];
  const seen = new Set([targetNode.node_token]);
  const spaceId = targetNode.space_id;
  let parentToken = targetNode.parent_node_token || "";

  for (let depth = 0; parentToken; depth += 1) {
    if (depth >= 100) {
      throw new Error("Wiki 父级层数超过 100，停止解析文档路径。");
    }
    if (seen.has(parentToken)) {
      throw new Error(`Wiki 父级链存在循环：${parentToken}`);
    }
    seen.add(parentToken);

    const parent = getWikiNode({ token: parentToken, identity, larkCli });
    if (spaceId && parent.space_id && parent.space_id !== spaceId) {
      throw new Error(`Wiki 父节点 ${parentToken} 不属于目标知识空间。`);
    }
    titles.unshift(requiredNodeTitle(parent));
    parentToken = parent.parent_node_token || "";
  }

  return titles;
}

function requiredNodeTitle(node) {
  const title = String(node.title || "").trim();
  if (!title) {
    throw new Error(`Wiki 节点 ${node.node_token || "unknown"} 缺少标题。`);
  }
  return title;
}

function extractWikiToken(remote, explicitType) {
  const match = String(remote).match(/\/wiki\/([^/?#]+)/i);
  if (match) return match[1];
  return explicitType === "wiki" ? remote : "";
}

function isBareToken(value) {
  return !/^https?:\/\//i.test(value);
}

function inspectDocument({ remote, explicitType, identity, larkCli }) {
  const commandArgs = ["drive", "+inspect", "--url", remote];
  if (explicitType) commandArgs.push("--type", explicitType);
  commandArgs.push("--as", identity, "--format", "json");
  return commandData(runLark(larkCli, commandArgs), "drive +inspect");
}

function getDriveMetadata({ token, type, identity, larkCli }) {
  const data = {
    request_docs: [{ doc_token: token, doc_type: type }],
    with_url: true,
  };
  const response = commandData(
    runLark(larkCli, [
      "drive",
      "metas",
      "batch_query",
      "--data",
      JSON.stringify(data),
      "--as",
      identity,
      "--format",
      "json",
    ]),
    "drive metas batch_query",
  );
  const meta = response.metas?.[0];
  if (!meta) {
    throw new Error(`未获取到文档 ${token} 的 Drive 元数据。`);
  }
  return meta;
}

function getWikiNode({ token, objType = "", identity, larkCli }) {
  const params = { token };
  if (objType) params.obj_type = objType;
  const data = commandData(
    runLark(larkCli, [
      "wiki",
      "spaces",
      "get_node",
      "--params",
      JSON.stringify(params),
      "--as",
      identity,
      "--format",
      "json",
    ]),
    "wiki spaces get_node",
  );
  if (!data.node) {
    throw new Error(`未获取到 Wiki 节点 ${token}。`);
  }
  return data.node;
}

function tryGetWikiNode(options) {
  try {
    return getWikiNode(options);
  } catch {
    return null;
  }
}

function runLark(binary, commandArgs) {
  const result = spawnSync(binary, commandArgs, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) throw result.error;

  const raw = result.stdout?.trim() || result.stderr?.trim() || "";
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`lark-cli 未返回有效 JSON：${raw || "无输出"}`);
  }
  if (result.status !== 0 || parsed.ok === false) {
    const message = parsed.error?.message || raw || `exit ${result.status}`;
    throw new Error(`lark-cli 调用失败：${message}`);
  }
  return parsed;
}

function commandData(response, commandName) {
  const data = response.data ?? response;
  if (!data || typeof data !== "object") {
    throw new Error(`${commandName} 未返回 data。`);
  }
  return data;
}

function formatShanghaiDate(epochSeconds) {
  if (!/^\d+$/.test(String(epochSeconds || ""))) {
    throw new Error("飞书元数据缺少有效的最后修改时间。");
  }
  const date = new Date(Number(epochSeconds) * 1000);
  if (Number.isNaN(date.getTime())) {
    throw new Error("飞书最后修改时间无法解析。");
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
