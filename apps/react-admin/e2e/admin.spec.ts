import { expect, test, type Page } from '@playwright/test';

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

async function login(page: Page) {
  await page.goto('/public/react-admin/#/login');
  await expect(page.getByPlaceholder('用户名')).toBeVisible();
  const loginTheme = await page
    .locator('.react-admin-theme')
    .evaluate((root) => {
      const theme = getComputedStyle(root);
      const card = document.querySelector<HTMLElement>('.login-card');
      return {
        primary: theme.getPropertyValue('--app-color-primary').trim(),
        pageBackground: getComputedStyle(root).backgroundColor,
        cardBorder: card ? getComputedStyle(card).borderColor : '',
      };
    });
  expect(loginTheme).toEqual({
    primary: '#0F766E',
    pageBackground: 'rgb(243, 247, 245)',
    cardBorder: 'rgb(220, 229, 226)',
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
  await page.getByPlaceholder('用户名').fill('admin');
  await page.getByPlaceholder('密码').fill('password');
  await page.getByRole('button', { name: '登 录' }).click();
  await expect(page.getByRole('button', { name: '手册.txt' })).toBeVisible();
  await expect(page.locator('.admin-brand-mark')).toHaveCSS(
    'background-color',
    'rgb(15, 118, 110)',
  );
  await expect(page.locator('.ant-layout-sider').first()).toHaveCSS(
    'background-color',
    'rgb(23, 33, 31)',
  );
}

async function expectPageSpacing(page: Page) {
  const spacing = await page
    .locator('.admin-page-container')
    .evaluate((root) => {
      const header = root.querySelector<HTMLElement>(
        '[class*="page-container-warp-page-header"]',
      );
      const content = root.querySelector<HTMLElement>(
        '[class*="page-container-children-container"]',
      );
      if (!header || !content)
        throw new Error('PageContainer layout not found');

      const headerStyle = getComputedStyle(header);
      const contentStyle = getComputedStyle(content);
      return {
        headerInlineStart: headerStyle.paddingInlineStart,
        headerInlineEnd: headerStyle.paddingInlineEnd,
        contentInlineStart: contentStyle.paddingInlineStart,
        contentInlineEnd: contentStyle.paddingInlineEnd,
        contentBlockEnd: contentStyle.paddingBlockEnd,
        hasHorizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      };
    });

  expect(spacing).toEqual({
    headerInlineStart: '12px',
    headerInlineEnd: '12px',
    contentInlineStart: '12px',
    contentInlineEnd: '12px',
    contentBlockEnd: '12px',
    hasHorizontalOverflow: false,
  });
}

test.beforeEach(async ({ page }) => {
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
});

test('login, browse, preview, upload and restore a drawer deep link', async ({
  page,
}, testInfo) => {
  await page.goto('/public/react-admin/#/login');
  await expect(page.getByPlaceholder('用户名')).toBeVisible();
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({ path: testInfo.outputPath('login-theme.png') });
  }
  await login(page);
  await expect(page.getByRole('button', { name: '手册.txt' })).toBeVisible();
  await expectPageSpacing(page);
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({
      path: testInfo.outputPath('document-management-theme.png'),
      fullPage: true,
    });
  }

  if (testInfo.project.name === 'desktop') {
    await page.locator('[class*="sider-collapsed-button"]').click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          window.localStorage.getItem('react-admin:sider-collapsed'),
        ),
      )
      .toBe('true');
    await expectPageSpacing(page);
  }

  await page.getByRole('button', { name: '手册.txt' }).click();
  await expect(page.getByRole('dialog')).toContainText('手册.txt');
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('button', { name: /添加文档/ }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: '新增.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('new document'),
  });
  await page.getByRole('button', { name: '开始上传' }).click();
  await expect(page.getByText('处理 1 个文件')).toBeVisible();
  await expect(page.getByRole('heading', { name: '新增.txt' })).toBeVisible();
  await page.getByRole('button', { name: /关\s*闭/ }).click();

  await page.getByText('切片实况', { exact: true }).click();
  await expect(page).toHaveURL(/drawer=document-chunks.*drawerCode=1/);
  await expect(page.getByText('第一段切片内容')).toBeVisible();
  await page.reload();
  await expect(page.getByText('第一段切片内容')).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
});

test('opens every menu route and keeps placeholder modules explicit', async ({
  page,
}) => {
  await login(page);
  const pages: Array<[string, string]> = [
    ['/knowledge/sessions', '消息对话记录'],
    ['/knowledge/assistant', '问答助手'],
    ['/business-agent/knowledge', '业务知识库管理'],
    ['/business-agent/skills', 'Skill 管理'],
    ['/business-agent/sessions', '会话管理'],
    ['/business-agent/config', '配置中心'],
    ['/business-agent/demo', '演示 Demo'],
  ];
  for (const [path, title] of pages) {
    await page.goto(`/public/react-admin/#${path}`);
    await expect(page.locator('main').getByText(title).first()).toBeVisible();
  }
  await page.goto('/public/react-admin/#/business-agent/skills');
  await expect(page.getByText('模块建设中')).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
});

test('loads RAG and business Agent histories with ordered visible parts', async ({
  page,
}, testInfo) => {
  await login(page);
  await page.goto('/public/react-admin/#/knowledge/assistant');
  await page.getByText('历史问题').click();
  await expect(page.getByText('历史提问')).toBeVisible();
  await expect(page.getByText('历史回答')).toBeVisible();

  await page.goto('/public/react-admin/#/business-agent/demo');
  await page.getByText('查询库存').click();
  const agentMessage = page.locator('.chat-message.assistant');
  await expect(agentMessage).toContainText('先查库存');
  await expect(agentMessage).toContainText('库存查询完成');
  await expect(agentMessage).toContainText('库存充足');
  await expect(agentMessage).toHaveText(
    /业务 Agent.*思考过程.*先查库存.*库存查询完成.*库存充足/,
  );
  await expect(agentMessage.locator('.chat-reasoning')).toHaveCSS(
    'color',
    'rgb(102, 115, 111)',
  );
  await expect(agentMessage.locator('[data-stage="tool_result"]')).toHaveClass(
    /chat-status-success/,
  );
  await expect(agentMessage.locator('[data-stage="tool_result"]')).toHaveCSS(
    'border-left-color',
    'rgb(22, 140, 105)',
  );
  await expect(agentMessage.locator('[data-stage="tool_call"]')).toHaveClass(
    /chat-status-warning/,
  );
  await expect(
    agentMessage.locator('[data-stage="generate_start"]'),
  ).toHaveClass(/chat-status-info/);
  await expect(agentMessage.locator('[data-stage="done"]')).toHaveClass(
    /chat-status-success/,
  );
  expect(
    await agentMessage
      .locator('[data-stage]')
      .evaluateAll((items) => items.map((item) => item.dataset.stage)),
  ).toEqual(['tool_call', 'tool_result', 'generate_start', 'done']);
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({
      path: testInfo.outputPath('business-agent-theme.png'),
      fullPage: true,
    });
  }
});
