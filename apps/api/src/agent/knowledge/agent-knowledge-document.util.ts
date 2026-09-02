import type { ParsedAgentKnowledgeDocument } from './type/agent-knowledge-document.type';

const TENANT_DISPLAY_PREFIXES: Record<string, string> = {
  aplus: 'Aplus',
  boat: 'Boat',
  yurex: 'Yurex',
};

/** 解析 Markdown YAML frontmatter 并返回元数据与剩余正文。 */
export function parseAgentKnowledgeDocument(
  raw: string,
): ParsedAgentKnowledgeDocument {
  const normalized = raw.replace(/^\uFEFF/, '');
  if (!/^---\s*$/.test(normalized.split(/\r?\n/, 1)[0] ?? '')) {
    return { metadata: {}, content: normalized.trim() };
  }

  const lines = normalized.split(/\r?\n/);
  const endIndex = lines.findIndex(
    (line, index) => index > 0 && /^---\s*$/.test(line),
  );
  if (endIndex === -1) {
    return { metadata: {}, content: normalized.trim() };
  }

  const metadata: Record<string, string> = {};
  for (const line of lines.slice(1, endIndex)) {
    const match = /^([^:]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    }
    metadata[match[1].trim()] = value;
  }

  return {
    metadata,
    content: lines
      .slice(endIndex + 1)
      .join('\n')
      .trim(),
  };
}

/** 从 docs 二级目录派生业务分类，并去除租户展示前缀。 */
export function resolveAgentKnowledgeCategory(
  tenantCode: string,
  sourcePath: string,
): string {
  const parts = sourcePath.split(/[\\/]/).filter(Boolean);
  const secondLevel = parts[1] ?? '';
  const prefix = TENANT_DISPLAY_PREFIXES[tenantCode] ?? '';
  return prefix
    ? secondLevel.replace(new RegExp(`^${prefix}\\s*`, 'i'), '').trim()
    : secondLevel;
}

/** 清理 Markdown 检索内容中的 frontmatter 残留、图片引用和冗余空白。 */
export function cleanAgentKnowledgeMarkdown(content: string): string {
  return content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
