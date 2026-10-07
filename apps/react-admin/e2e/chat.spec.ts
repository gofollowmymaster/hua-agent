import { expect, test } from './support/admin-test';
import { login } from './support/ui';

function uiMessageStream(events: Record<string, unknown>[]) {
  return `${events
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join('')}data: [DONE]\n\n`;
}

function orderCardCommands(status: string) {
  return [
    {
      version: 'v0.9',
      createSurface: {
        surfaceId: 'order-e2e',
        catalogId: 'local://aplus-agent-order-v0.9',
      },
    },
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'order-e2e',
        components: [
          { id: 'root', component: 'OrderDetail', value: { path: '/order' } },
        ],
      },
    },
    {
      version: 'v0.9',
      updateDataModel: {
        surfaceId: 'order-e2e',
        path: '/order',
        value: { dsOrderNo: 'DS-E2E', status },
      },
    },
  ];
}

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
  await expect(page.locator('.react-ui-kit-markdown').first()).toHaveCSS(
    'font-size',
    '12px',
  );
  await expect(page.locator('.react-ui-kit-workspace')).toHaveCSS('gap', '8px');
  await expect(page.locator('.react-ui-kit-messages')).toHaveCSS(
    'padding-top',
    '12px',
  );
  await expect(page.locator('.react-ui-kit-sender')).toHaveCSS(
    'padding-top',
    '10px',
  );
  if (testInfo.project.name === 'desktop') {
    await expect(page.locator('.react-ui-kit-workspace')).toHaveCSS(
      'grid-template-columns',
      /280px/,
    );
  }
  const agentMessage = page.locator(
    '.react-ui-kit-message-parts[data-message-role="assistant"]',
  );
  await expect(agentMessage).toContainText('先查库存');
  await expect(agentMessage).toContainText('库存查询完成');
  await expect(agentMessage).toContainText('库存充足');
  await expect(agentMessage).toHaveText(
    /思考过程.*先查库存.*库存查询完成.*库存充足/,
  );
  await expect(agentMessage.locator('.react-ui-kit-reasoning')).toBeVisible();
  await expect(agentMessage.locator('[data-stage="tool_result"]')).toHaveClass(
    /react-ui-kit-status-success/,
  );
  await expect(agentMessage.locator('[data-stage="tool_call"]')).toHaveClass(
    /react-ui-kit-status-warning/,
  );
  await expect(
    agentMessage.locator('[data-stage="generate_start"]'),
  ).toHaveClass(/react-ui-kit-status-info/);
  await expect(agentMessage.locator('[data-stage="done"]')).toHaveClass(
    /react-ui-kit-status-success/,
  );
  expect(
    await agentMessage
      .locator('[data-stage]')
      .evaluateAll((items) => items.map((item) => item.dataset.stage)),
  ).toEqual(['tool_call', 'tool_result', 'generate_start', 'done']);
  const messageScroll = page.locator('.react-ui-kit-bubble-scroll');
  await expect(messageScroll).toHaveCSS('overflow-y', 'auto');
  const scrollSize = await messageScroll.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(scrollSize.scrollHeight).toBeGreaterThan(scrollSize.clientHeight);
  await messageScroll.evaluate((element) => {
    element.scrollTop = -element.scrollHeight;
  });
  expect(
    await messageScroll.evaluate((element) => element.scrollTop),
  ).toBeLessThan(0);
  await page.screenshot({
    path: testInfo.outputPath('business-agent-theme.png'),
    fullPage: true,
  });
});

test('shows AI SDK stream errors in the shared chat workspace', async ({
  page,
}) => {
  await page.route('**/agent/chat', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: {
        'x-vercel-ai-ui-message-stream': 'v1',
      },
      body: 'data: {"type":"error","errorText":"生成失败，请稍后重试"}\n\n',
    }),
  );
  await login(page);
  await page.goto('/public/react-admin/#/business-agent/demo');

  const sender = page.getByRole('textbox');
  await sender.fill('触发流错误');
  await sender.press('Enter');

  await expect(page.getByText('生成失败，请稍后重试')).toBeVisible();
  await expect(page.getByText('出错')).toBeVisible();
});

test('shows realtime reasoning from an AI SDK 7 stream', async ({ page }) => {
  await page.route('**/agent/chat', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: {
        'x-vercel-ai-ui-message-stream': 'v1',
      },
      body: uiMessageStream([
        {
          type: 'data-status',
          data: { stage: 'analyze_start', message: '开始分析问题' },
        },
        { type: 'reasoning-start', id: 'reasoning-live' },
        {
          type: 'reasoning-delta',
          id: 'reasoning-live',
          delta: '先核对库存与订单状态',
        },
        { type: 'reasoning-end', id: 'reasoning-live' },
        {
          type: 'data-status',
          data: { stage: 'generate_start', message: '开始生成答案' },
        },
        { type: 'text-start', id: 'text-live' },
        {
          type: 'text-delta',
          id: 'text-live',
          delta: '库存状态正常',
        },
        { type: 'text-end', id: 'text-live' },
      ]),
    }),
  );
  await login(page);
  await page.goto('/public/react-admin/#/business-agent/demo');

  const sender = page.getByRole('textbox');
  await sender.fill('查询实时库存');
  await sender.press('Enter');

  const message = page.locator(
    '.react-ui-kit-message-parts[data-message-role="assistant"]',
  );
  await expect(message.locator('.react-ui-kit-reasoning')).toBeVisible();
  await expect(message).toHaveText(
    /开始分析问题.*思考过程.*先核对库存与订单状态.*开始生成答案.*库存状态正常/,
  );
});

test('renders the order card after final text and persists inline actions', async ({
  page,
}) => {
  let actionBody: Record<string, unknown> | undefined;
  const initialCommands = orderCardCommands('PENDING_AUDIT');
  const updateCommand = {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: 'order-e2e',
      path: '/order',
      value: { dsOrderNo: 'DS-E2E', status: 'REJECTED', tipMsg: '资料不完整' },
    },
  };
  await page.route('**/agent/chat/a2ui/actions', async (route) => {
    actionBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        message: 'ok',
        body: { surfaceId: 'order-e2e', commands: [updateCommand] },
      }),
    });
  });
  await page.route('**/agent/chat', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: { 'x-vercel-ai-ui-message-stream': 'v1' },
      body: uiMessageStream([
        {
          type: 'data-status',
          data: {
            stage: 'tool_result',
            message: '工具执行完成：get_ds_order',
            tool: 'get_ds_order',
            arguments: { ds_order_no: 'DS-E2E' },
            result: '{"dsOrderNo":"DS-E2E","status":"PENDING_AUDIT"}',
          },
        },
        {
          type: 'data-status',
          data: { stage: 'generate_start', message: '开始生成答案' },
        },
        { type: 'text-start', id: 'order-text' },
        {
          type: 'text-delta',
          id: 'order-text',
          delta: '请核对订单信息并完成审核。',
        },
        { type: 'text-end', id: 'order-text' },
        {
          type: 'data-a2ui',
          data: {
            surfaceId: 'order-e2e',
            conversationId: 'conversation-e2e',
            commands: initialCommands,
          },
        },
        {
          type: 'data-status',
          data: { stage: 'done', message: '生成完成' },
        },
      ]),
    }),
  );

  await login(page);
  await page.goto('/public/react-admin/#/business-agent/demo');
  const sender = page.getByRole('textbox').last();
  await sender.fill('审核 DS-E2E');
  await sender.press('Enter');

  const message = page
    .locator('.react-ui-kit-message-parts[data-message-role="assistant"]')
    .last();
  const intro = message.getByText('请核对订单信息并完成审核。');
  const card = message.locator('.agent-a2ui-order-card');
  await expect(intro).toBeVisible();
  await expect(card).toBeVisible();
  expect(
    await message
      .locator('.react-ui-kit-markdown, .agent-a2ui-order-card')
      .evaluateAll((items) =>
        items.map((item) =>
          item.classList.contains('react-ui-kit-markdown') ? 'text' : 'card',
        ),
      ),
  ).toEqual(['text', 'card']);

  await message.getByLabel('审核意见（驳回时必填）').fill('资料不完整');
  await message.getByRole('button', { name: /驳\s*回/ }).click();
  await expect(card.getByText('REJECTED')).toBeVisible();
  expect(actionBody).toEqual({
    conversationId: 'conversation-e2e',
    surfaceId: 'order-e2e',
    action: 'reject',
    reason: '资料不完整',
  });

  await page.route('**/agent/chat/sessions/31/messages', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        message: 'ok',
        body: [
          {
            id: 312,
            role: 'assistant',
            content: '请核对订单信息并完成审核。',
            parts: [
              { type: 'text', text: '请核对订单信息并完成审核。' },
              {
                type: 'data-a2ui',
                data: {
                  surfaceId: 'order-e2e',
                  conversationId: 'agent-conversation-1',
                  commands: [...initialCommands, updateCommand],
                },
              },
              {
                type: 'data-status',
                data: { stage: 'done', message: '生成完成' },
              },
            ],
            createdAt: '2026-10-07T00:00:00Z',
          },
        ],
      }),
    }),
  );
  await page.reload();
  await page.getByText('查询库存').click();
  await expect(page.getByText('REJECTED')).toBeVisible();
  await expect(page.getByLabel('审核意见（驳回时必填）')).toHaveCount(0);
});
