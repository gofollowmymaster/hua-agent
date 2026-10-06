import { expect, test, type Locator, type Page } from '@playwright/test';

function json(body: unknown) {
  return JSON.stringify({ code: 200, message: 'ok', body });
}

async function getInputControlHeight(locator: Locator) {
  return locator.evaluate((element) => {
    const control = element.closest('.ant-input-affix-wrapper') || element;
    return Math.round(control.getBoundingClientRect().height);
  });
}

async function getFontSize(locator: Locator) {
  return locator.evaluate((element) =>
    Math.round(Number.parseFloat(getComputedStyle(element).fontSize)),
  );
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

async function login(page: Page) {
  await page.goto('/public/react-admin/#/login');
  const usernameInput = page.getByPlaceholder('用户名');
  await expect(usernameInput).toBeVisible();
  await expect(usernameInput).toHaveClass(/ant-input-lg/);
  await expect(usernameInput).toHaveCSS('font-size', '12px');
  expect(await getInputControlHeight(usernameInput)).toBe(40);
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
  await expect(page.locator('.ant-pro-layout-header')).toHaveCSS(
    'height',
    '48px',
  );
  await expect(page.locator('.ant-pro-sider .ant-menu-item').first()).toHaveCSS(
    'font-size',
    '12px',
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
  const rebuildButton = page.getByRole('button', {
    name: /强制重建索引/,
  });
  await expect(rebuildButton).toHaveCSS('height', '30px');
  await expect(rebuildButton).toHaveCSS('box-shadow', 'none');
  await expect(page.locator('.ant-pro-layout-header')).toHaveCSS(
    'border-bottom-width',
    '0px',
  );
  await expect(page.locator('.ant-pro-layout-header')).toHaveCSS(
    'box-shadow',
    'none',
  );
  expect(
    await getInputControlHeight(page.getByPlaceholder('文件名 / 路径')),
  ).toBe(30);
  await expect(page.locator('.ant-pro-query-filter')).toHaveCSS(
    'padding-top',
    '12px',
  );
  await expect(page.locator('.ant-pro-query-filter')).toHaveCSS(
    'padding-left',
    '12px',
  );
  await expect(page.locator('.ant-table-thead th').first()).toHaveCSS(
    'padding-top',
    '6px',
  );
  await expect(page.locator('.ant-table-thead th').first()).toHaveCSS(
    'padding-left',
    '8px',
  );
  await expect(page.locator('.ant-table-tbody td').first()).toHaveCSS(
    'font-size',
    '12px',
  );
  await expect(page.locator('.semantic-tag-success').first()).toHaveCSS(
    'font-size',
    '12px',
  );
  await expect(page.locator('.ant-pagination')).toHaveCSS('font-size', '12px');
  await expect(page.locator('.ant-breadcrumb')).toHaveCSS('font-size', '12px');
  expect(
    await getFontSize(page.locator('.ant-page-header-heading-title')),
  ).toBeGreaterThan(12);
  const compactHeaderHeight = await page
    .locator('.ant-table-thead tr')
    .first()
    .evaluate((element) => Math.round(element.getBoundingClientRect().height));
  expect(compactHeaderHeight).toBeGreaterThanOrEqual(31);
  expect(compactHeaderHeight).toBeLessThanOrEqual(33);
  const tableToolbar = page.locator('.ant-pro-table-list-toolbar');
  await expect(tableToolbar.locator('..')).toHaveCSS('padding-left', '12px');
  await expect(
    tableToolbar.locator('.ant-pro-table-list-toolbar-container'),
  ).toHaveCSS('padding-top', '12px');
  await expect(page.locator('.ant-pagination')).toHaveClass(
    /ant-pagination-mini/,
  );

  await page.locator('[aria-label="column-height"]').click();
  const densityMenu = page.locator(
    '.ant-dropdown:not(.ant-dropdown-hidden):visible',
  );
  await expect(densityMenu).toBeVisible();
  const regularDensityItem = densityMenu
    .locator('.ant-dropdown-menu-item')
    .filter({ hasText: '宽松' });
  const compactDensityItem = densityMenu
    .locator('.ant-dropdown-menu-item-selected')
    .filter({ hasText: '紧凑' });
  await expect(regularDensityItem).toHaveCSS('color', 'rgb(31, 41, 38)');
  await expect(compactDensityItem).toHaveCSS(
    'background-color',
    'rgb(221, 247, 239)',
  );
  await expect(compactDensityItem).toHaveCSS('color', 'rgb(17, 94, 89)');
  await regularDensityItem.hover();
  await expect(regularDensityItem).toHaveCSS(
    'background-color',
    'rgb(201, 239, 228)',
  );
  await regularDensityItem.click();
  await expect(page.locator('.ant-table-thead th').first()).toHaveCSS(
    'padding-top',
    '12px',
  );
  await expect(page.locator('.ant-table-thead th').first()).toHaveCSS(
    'padding-left',
    '16px',
  );
  await page.locator('[aria-label="column-height"]').click();
  await page
    .locator('.ant-dropdown:not(.ant-dropdown-hidden):visible')
    .locator('.ant-dropdown-menu-item')
    .filter({ hasText: '中等' })
    .click();
  await expect(page.locator('.ant-table-thead th').first()).toHaveCSS(
    'padding-top',
    '8px',
  );
  await expect(page.locator('.ant-table-thead th').first()).toHaveCSS(
    'padding-left',
    '12px',
  );
  await page.locator('[aria-label="column-height"]').click();
  await page
    .locator('.ant-dropdown:not(.ant-dropdown-hidden):visible')
    .locator('.ant-dropdown-menu-item')
    .filter({ hasText: '紧凑' })
    .click();
  await expect(page.locator('.ant-table-thead th').first()).toHaveCSS(
    'padding-top',
    '6px',
  );
  await expect(page.locator('.ant-table-thead th').first()).toHaveCSS(
    'padding-left',
    '8px',
  );
  if (testInfo.project.name === 'desktop') {
    await expect(page.locator('.ant-layout-sider').first()).toHaveCSS(
      'width',
      '200px',
    );
    await expect(
      page.locator('.ant-pro-sider .ant-menu-submenu-title').first(),
    ).toHaveCSS('height', '36px');
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
    await page.locator('.ant-pro-sider .ant-menu-submenu').first().hover();
    const submenuPopup = page.locator('.ant-menu-submenu-popup:visible');
    await expect(submenuPopup).toBeVisible();
    await expect(submenuPopup.locator('> .ant-menu')).toHaveCSS(
      'background-color',
      'rgb(29, 43, 39)',
    );
    const selectedMenuItem = submenuPopup
      .locator('.ant-menu-item-selected')
      .filter({ hasText: '文档管理' });
    const regularMenuItem = submenuPopup
      .locator('.ant-menu-item')
      .filter({ hasText: '消息对话记录' });
    await expect(selectedMenuItem).toHaveCSS('color', 'rgb(94, 234, 212)');
    await expect(regularMenuItem).toHaveCSS('color', 'rgb(197, 208, 204)');
    await regularMenuItem.hover();
    await expect(regularMenuItem).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.screenshot({
      path: testInfo.outputPath('collapsed-menu-theme.png'),
    });
  }

  await page.getByRole('button', { name: '手册.txt' }).click();
  const previewDialog = page.getByRole('dialog');
  await expect(previewDialog).toContainText('手册.txt');
  expect(
    await getFontSize(previewDialog.locator('.ant-modal-title')),
  ).toBeGreaterThan(12);
  await expect(previewDialog.locator('.ant-modal-content')).toHaveCSS(
    'padding-top',
    '12px',
  );
  await expect(previewDialog.locator('.ant-modal-content')).toHaveCSS(
    'padding-left',
    '16px',
  );
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
  expect(await getFontSize(page.locator('.ant-drawer-title'))).toBeGreaterThan(
    12,
  );
  await expect(page.locator('.ant-drawer-body')).toHaveCSS(
    'padding-top',
    '16px',
  );
  await expect(page.locator('.ant-drawer-body')).toHaveCSS(
    'padding-left',
    '16px',
  );
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({
      path: testInfo.outputPath('document-drawer-compact.png'),
    });
  }
  await page.reload();
  await expect(page.getByText('第一段切片内容')).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
});

test('opens every menu route and keeps placeholder modules explicit', async ({
  page,
}, testInfo) => {
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
  if (testInfo.project.name === 'desktop') {
    await page.goto('/public/react-admin/#/knowledge/sessions');
    await page.screenshot({
      path: testInfo.outputPath('session-management-compact.png'),
      fullPage: true,
    });
  }
  await page.goto('/public/react-admin/#/business-agent/skills');
  await expect(page.getByRole('tab', { name: '系统 Skill' })).toBeVisible();
  await page.getByRole('tab', { name: '用户 Skill' }).click();
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({
      path: testInfo.outputPath('skill-management-compact.png'),
      fullPage: true,
    });
  }
  await page.getByRole('button', { name: /新建 Skill/ }).click();
  await expect(page.getByText('新建用户 Skill')).toBeVisible();
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({
      path: testInfo.outputPath('skill-modal-compact.png'),
    });
  }
  await page.getByRole('button', { name: '取 消' }).click();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');

  await page.goto('/public/react-admin/#/business-agent/knowledge');
  const breadcrumb = page.locator('.ant-breadcrumb');
  await expect(breadcrumb.locator('li').first()).toHaveCSS(
    'color',
    'rgb(102, 115, 111)',
  );
  await expect(
    breadcrumb.locator('.ant-breadcrumb-separator').first(),
  ).toHaveCSS('color', 'rgb(102, 115, 111)');
  await expect(breadcrumb.locator('li').last()).toHaveCSS(
    'color',
    'rgb(31, 41, 38)',
  );
  const categoryTag = page.locator('.semantic-tag-info', {
    hasText: '版本更新日志',
  });
  const statusTag = page.locator('.semantic-tag-success', {
    hasText: 'ready',
  });
  await expect(categoryTag).toHaveCSS('color', 'rgb(29, 78, 216)');
  await expect(categoryTag).toHaveCSS('font-size', '12px');
  await expect(categoryTag).toHaveCSS('background-color', 'rgb(239, 246, 255)');
  await expect(statusTag).toHaveCSS('color', 'rgb(17, 94, 89)');
  await expect(statusTag).toHaveCSS('background-color', 'rgb(221, 247, 239)');
  await page.getByRole('button', { name: '2026年8月更新.md' }).click();
  await expect(page.getByRole('dialog')).toContainText('业务知识预览正文');
  await page.getByRole('button', { name: 'Close' }).click();
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({
      path: testInfo.outputPath('business-knowledge-theme.png'),
      fullPage: true,
    });
  }
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
  await expect(page.locator('.chat-text').first()).toHaveCSS(
    'font-size',
    '12px',
  );
  await expect(page.locator('.chat-demo-workspace')).toHaveCSS('gap', '8px');
  await expect(page.locator('.chat-messages')).toHaveCSS('padding-top', '12px');
  await expect(page.locator('.chat-composer')).toHaveCSS('padding-top', '10px');
  if (testInfo.project.name === 'desktop') {
    await expect(page.locator('.chat-demo-workspace')).toHaveCSS(
      'grid-template-columns',
      /280px/,
    );
  }
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
