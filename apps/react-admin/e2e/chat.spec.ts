import { expect, test } from './support/admin-test';
import { login } from './support/ui';

function uiMessageStream(events: Record<string, unknown>[]) {
  return `${events
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join('')}data: [DONE]\n\n`;
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
