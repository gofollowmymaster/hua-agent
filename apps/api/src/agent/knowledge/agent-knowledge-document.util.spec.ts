import {
  cleanAgentKnowledgeMarkdown,
  parseAgentKnowledgeDocument,
  resolveAgentKnowledgeCategory,
} from './agent-knowledge-document.util';

describe('agent-knowledge-document.util', () => {
  it('parses frontmatter metadata and returns remaining content', () => {
    const raw = `---
远程文档: "https://example.com/wiki/abc"
文档ID: "doc-1"
Wiki节点ID: "node-1"
最后修改时间: "2026-08-06"
文档路径面包屑: "Yurex经验分享 > 亚马逊VC知识"
source_type: feishu-doc
当前版本: "v1.0.0"
---

# 标题

正文内容
`;

    const parsed = parseAgentKnowledgeDocument(raw);

    expect(parsed.metadata).toMatchObject({
      远程文档: 'https://example.com/wiki/abc',
      文档ID: 'doc-1',
      Wiki节点ID: 'node-1',
      最后修改时间: '2026-08-06',
      文档路径面包屑: 'Yurex经验分享 > 亚马逊VC知识',
      source_type: 'feishu-doc',
      当前版本: 'v1.0.0',
    });
    expect(parsed.content).toContain('# 标题');
    expect(parsed.content).not.toContain('远程文档');
  });

  it('returns empty metadata when frontmatter is missing', () => {
    const parsed = parseAgentKnowledgeDocument('# 无元数据文档\n\n正文');

    expect(parsed.metadata).toEqual({});
    expect(parsed.content).toContain('正文');
  });

  it('cleans image references and collapses redundant blank lines', () => {
    const cleaned = cleanAgentKnowledgeMarkdown(
      '![截图](./assets/images/a.png)\n\n\n正文\n\n\n![另一张](./assets/images/b.png)',
    );

    expect(cleaned).not.toContain('![截图]');
    expect(cleaned).not.toContain('![另一张]');
    expect(cleaned).toContain('正文');
    expect(cleaned).not.toContain('\n\n\n');
  });

  it('derives category from second-level docs directory without tenant prefix', () => {
    expect(
      resolveAgentKnowledgeCategory(
        'yurex',
        'yurex/Yurex业务流程/日常业务跟进/POA处理.md',
      ),
    ).toBe('业务流程');
    expect(
      resolveAgentKnowledgeCategory(
        'yurex',
        'yurex/Yurex 操作指南/仓储/入库管理.md',
      ),
    ).toBe('操作指南');
    expect(
      resolveAgentKnowledgeCategory(
        'yurex',
        'yurex/版本更新日志/2026年更新/2026年8月更新.md',
      ),
    ).toBe('版本更新日志');
  });
});
