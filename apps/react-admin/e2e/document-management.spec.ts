import { expect, test } from './support/admin-test';
import {
  expectPageSpacing,
  getFontSize,
  getInputControlHeight,
  login,
} from './support/ui';

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
  const previewDialogContainer = previewDialog.locator(
    ':scope > .ant-modal-container',
  );
  await expect(previewDialogContainer).toHaveCSS('padding-top', '12px');
  await expect(previewDialogContainer).toHaveCSS('padding-left', '16px');
  await previewDialog.getByRole('button', { name: '关闭' }).click();

  await page.getByRole('button', { name: /添加文档/ }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: '新增.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('new document'),
  });
  await page.getByRole('button', { name: '开始上传' }).click();
  await expect(page.getByText('处理 1 个文件')).toBeVisible();
  await expect(page.getByRole('heading', { name: '新增.txt' })).toBeVisible();
  await page.getByRole('button', { name: '关 闭', exact: true }).click();

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
