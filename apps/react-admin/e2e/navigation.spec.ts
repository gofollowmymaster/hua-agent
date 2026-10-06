import { expect, test } from './support/admin-test';
import { login } from './support/ui';

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
  await page.getByRole('dialog').getByRole('button', { name: '关闭' }).click();
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({
      path: testInfo.outputPath('business-knowledge-theme.png'),
      fullPage: true,
    });
  }
});
