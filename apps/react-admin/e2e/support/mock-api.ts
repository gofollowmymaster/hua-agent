import type { Page } from '@playwright/test';

function json(body: unknown) {
  return JSON.stringify({ code: 200, message: 'ok', body });
}

const documentItem = {
  id: 1,
  fileName: '手册.txt',
  sourcePath: 'raw/手册.txt',
  fileType: 'txt',
  type: 'manual',
  tag: 'demo',
  fileSize: 1024,
  chunkCount: 2,
  actualChunkCount: 2,
  status: 'ready',
  createdAt: '2026-10-05T00:00:00Z',
  updatedAt: '2026-10-05T00:00:00Z',
};

const agentKnowledgeItem = {
  id: 41,
  tenantCode: 'A',
  category: '版本更新日志',
  sourcePath: 'yurex/版本更新日志/2026年更新/2026年8月更新.md',
  fileName: '2026年8月更新.md',
  fileType: 'md',
  fileHash: 'agent-document-hash',
  fileSize: 2048,
  chunkCount: 1,
  actualChunkCount: 1,
  status: 'ready',
  metadata: {},
  breadcrumb: '版本更新日志 > 2026年更新 > 2026年8月更新',
  createdAt: '2026-10-05T00:00:00Z',
  updatedAt: '2026-10-05T00:00:00Z',
};

export async function installAdminApiMocks(page: Page) {
  await page.route('**/auth/login', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json({
        token: `header.${Buffer.from(
          JSON.stringify({
            userId: 'admin-1',
            userName: '管理员',
            supplierCode: 'A',
          }),
        ).toString('base64url')}.signature`,
      }),
    }),
  );
  await page.route('**/ai/rag/admin/documents/page', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json({ list: [documentItem], total: 1, page: 1, pageSize: 20 }),
    }),
  );
  await page.route('**/ai/rag/admin/documents/1/preview', (route) =>
    route.fulfill({ contentType: 'text/plain', body: 'preview content' }),
  );
  await page.route('**/ai/rag/admin/documents/1/chunks/page', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json({
        list: [
          {
            id: 11,
            documentId: 1,
            chunkIndex: 0,
            content: '第一段切片内容',
            metadata: {},
            createdAt: '2026-10-05T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      }),
    }),
  );
  await page.route('**/ai/rag/admin/documents/1', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json(documentItem),
    }),
  );
  await page.route('**/ai/rag/admin/documents/upload', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json({
        totalFiles: 1,
        indexedFiles: 1,
        duplicateFiles: 0,
        failedFiles: 0,
        chunks: 1,
        files: [
          {
            fileName: '新增.txt',
            status: 'indexed',
            sourcePath: 'raw/新增.txt',
            chunks: 1,
          },
        ],
      }),
    }),
  );
  await page.route('**/ai/rag/admin/sessions/page', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json({
        list: [
          {
            id: 21,
            channel: 'web',
            sessionKey: 'rag-session-1',
            conversationId: 'rag-conversation-1',
            conversationType: 'rag-chat',
            userId: 'admin-1',
            messageCount: 2,
            latestMessage: {
              role: 'assistant',
              content: '历史问题',
              createdAt: '2026-10-05T00:00:00Z',
            },
            lastActiveAt: '2026-10-05T00:00:00Z',
            createdAt: '2026-10-05T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      }),
    }),
  );
  await page.route('**/ai/rag/admin/sessions/21/messages', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json([
        {
          id: 211,
          role: 'user',
          content: '历史提问',
          createdAt: '2026-10-05T00:00:00Z',
        },
        {
          id: 212,
          role: 'assistant',
          content: '历史回答',
          createdAt: '2026-10-05T00:00:01Z',
        },
      ]),
    }),
  );
  await page.route(/\/agent\/knowledge\/documents(?:\?.*)?$/, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json({
        list: [agentKnowledgeItem],
        total: 1,
        page: 1,
        pageSize: 20,
      }),
    }),
  );
  await page.route('**/agent/knowledge/documents/41/preview', (route) =>
    route.fulfill({
      contentType: 'text/markdown',
      body: '# 2026 年 8 月更新\n\n业务知识预览正文',
    }),
  );
  await page.route('**/agent/chat/sessions/page', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json({
        list: [
          {
            id: 31,
            conversationId: 'agent-conversation-1',
            latestMessage: {
              role: 'assistant',
              content: '查询库存',
              createdAt: '2026-10-05T00:00:00Z',
            },
            messageCount: 2,
            lastActiveAt: '2026-10-05T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      }),
    }),
  );
  await page.route('**/agent/chat/sessions/31/messages', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json([
        {
          id: 311,
          role: 'assistant',
          content: '库存充足',
          parts: [
            { type: 'reasoning', text: '先查库存' },
            {
              type: 'data-status',
              data: { stage: 'tool_call', tool: 'search_inventory' },
            },
            {
              type: 'data-status',
              data: { stage: 'tool_result', message: '库存查询完成' },
            },
            {
              type: 'data-status',
              data: { stage: 'generate_start', message: '开始生成回答' },
            },
            { type: 'text', text: '库存充足' },
            {
              type: 'data-status',
              data: { stage: 'done', message: '回答完成' },
            },
          ],
          createdAt: '2026-10-05T00:00:00Z',
        },
      ]),
    }),
  );
  await page.route(/\/agent\/skills\/system(?:\?.*)?$/, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json([
        {
          key: 'business-knowledge',
          type: 'system',
          name: '业务知识检索',
          description: '检索业务知识库。',
          instruction: '优先调用 search_knowledge。',
          isEnabled: true,
          readonly: true,
        },
      ]),
    }),
  );
  await page.route('**/agent/skills/user/page', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: json({ list: [], total: 0, page: 1, pageSize: 20 }),
    }),
  );
}
