import { expect, test } from './support/admin-test';
import { login } from './support/ui';

test('manage global digital avatar txt documents', async ({ page }) => {
  await page.goto('/public/react-admin/#/login');
  await login(page);
  await page.goto('/public/react-admin/#/digital-avatar/documents');

  await expect(
    page.getByTestId('pro-page-header').getByText('数字分身文档管理'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '课程-01大纲_2025-05-27.txt' }),
  ).toBeVisible();
  await expect(page.getByText('这是最后一节派生的文档摘要。')).toBeVisible();

  await page.getByText('摘要', { exact: true }).last().click();
  const summaryDialog = page.getByRole('dialog');
  await summaryDialog.getByLabel('摘要').fill('人工编辑摘要');
  await summaryDialog.getByRole('button', { name: /确 定/ }).click();
  await expect(summaryDialog).toBeHidden();

  await page.getByRole('button', { name: /添加文档/ }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: '新增课程.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('## 正文\n内容\n## 总结\n摘要'),
  });
  await page.getByRole('button', { name: '开始上传' }).click();
  await expect(page.getByText('处理 1 个文件')).toBeVisible();
  await page.getByRole('button', { name: /关 闭/, exact: true }).click();

  await page.getByText('切片', { exact: true }).click();
  await expect(page).toHaveURL(/drawer=digital-avatar-chunks.*drawerCode=51/);
  await expect(page.getByText('数字分身切片正文')).toBeVisible();
  await page.reload();
  await expect(page.getByText('数字分身切片正文')).toBeVisible();
  await page.getByRole('button', { name: '关闭' }).click();

  await page.getByText('重建', { exact: true }).click();
  await expect(page.getByText('将重建全部切片')).toBeVisible();
  await page.getByRole('button', { name: '重新入库' }).click();
  await expect(page.getByText('文档切片和摘要已重新入库')).toBeVisible();

  await page
    .getByRole('button', { name: '课程-01大纲_2025-05-27.txt' })
    .click();
  await expect(page.getByRole('dialog')).toContainText(
    '课程-01大纲_2025-05-27.txt',
  );
  await page.keyboard.press('Escape');

  await page.getByText('删除', { exact: true }).click();
  await expect(page.locator('.ant-modal-confirm-title')).toHaveText(
    '确认删除文档？',
  );
  await page.getByRole('button', { name: /删 除/, exact: true }).click();
  await expect(page.getByText('文档及切片已删除')).toBeVisible();
});
