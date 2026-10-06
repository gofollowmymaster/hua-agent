import { expect, type Locator, type Page } from '@playwright/test';

export async function getInputControlHeight(locator: Locator) {
  return locator.evaluate((element) => {
    const control = element.closest('.ant-input-affix-wrapper') || element;
    return Math.round(control.getBoundingClientRect().height);
  });
}

export async function getFontSize(locator: Locator) {
  return locator.evaluate((element) =>
    Math.round(Number.parseFloat(getComputedStyle(element).fontSize)),
  );
}

export async function login(page: Page) {
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
  if ((page.viewportSize()?.width ?? 0) > 768) {
    await expect(
      page.locator('.ant-pro-sider .ant-menu-item').first(),
    ).toHaveCSS('font-size', '12px');
  }
}

export async function expectPageSpacing(page: Page) {
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
