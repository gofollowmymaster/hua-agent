import { expect, test } from './support/admin-test';
import { login } from './support/ui';

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
