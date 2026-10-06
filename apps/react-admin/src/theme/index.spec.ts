import { describe, expect, it } from 'vitest';
import { resolveTenantAuthConfig } from '@/auth/tenant';
import {
  compactProTableProps,
  proLayoutTheme,
  reactAdminTheme,
  reactAdminWorkspaceTheme,
  themePalette,
} from './index';

function relativeLuminance(hex: string) {
  const [red, green, blue] = [1, 3, 5]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const values = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe('react admin theme', () => {
  it('exposes the approved graphite and teal tokens', () => {
    expect(reactAdminTheme.token).toMatchObject({
      colorPrimary: '#0F766E',
      colorPrimaryHover: '#0D9488',
      colorPrimaryActive: '#115E59',
      colorBgLayout: '#F3F7F5',
      colorText: '#1F2926',
      fontSize: 12,
      fontSizeSM: 12,
      borderRadius: 6,
    });
    expect(proLayoutTheme).toMatchObject({
      bgLayout: '#F3F7F5',
      sider: {
        colorMenuBackground: '#17211F',
        colorTextMenuSelected: '#5EEAD4',
      },
      header: { colorBgHeader: '#17211F' },
    });
    expect(reactAdminTheme.components).toMatchObject({
      Button: { dangerShadow: 'none' },
      Breadcrumb: {
        itemColor: '#66736F',
        lastItemColor: '#1F2926',
        separatorColor: '#66736F',
        linkHoverColor: '#0F766E',
      },
      Dropdown: {
        colorText: '#1F2926',
        colorPrimary: '#115E59',
        colorBgElevated: '#FFFFFF',
        controlItemBgHover: '#C9EFE4',
        controlItemBgActive: '#DDF7EF',
        controlItemBgActiveHover: '#C9EFE4',
      },
      Input: {
        inputFontSize: 12,
        inputFontSizeLG: 12,
        inputFontSizeSM: 12,
      },
    });
  });

  it('uses one theme for every supported tenant', () => {
    const tenants = [
      resolveTenantAuthConfig('aplnk.com'),
      resolveTenantAuthConfig('clouboat.com'),
      resolveTenantAuthConfig('yurexcc.com'),
    ];

    expect(tenants.map((tenant) => tenant.supplierCode)).toEqual([
      'A',
      'C',
      'D',
    ]);
    expect(tenants.map(() => reactAdminTheme.token?.colorPrimary)).toEqual([
      themePalette.primary,
      themePalette.primary,
      themePalette.primary,
    ]);
  });

  it('defines a medium-density workspace without shrinking large controls', () => {
    expect(reactAdminWorkspaceTheme).toMatchObject({
      token: {
        controlHeight: 30,
        controlHeightLG: 40,
        paddingLG: 16,
      },
      components: {
        Card: { headerHeight: 44, bodyPadding: 16 },
        Drawer: { footerPaddingInline: 16 },
        Form: { itemMarginBottom: 12 },
        Menu: { itemHeight: 36, collapsedWidth: 64 },
        Pagination: { itemSize: 30 },
        Table: { cellPaddingBlockMD: 8, cellPaddingInlineMD: 12 },
        Tabs: { horizontalItemPadding: '8px 0' },
      },
    });
    expect(proLayoutTheme.header?.heightLayoutHeader).toBe(48);
    expect(reactAdminWorkspaceTheme.token).not.toHaveProperty('fontSize');
    expect(reactAdminWorkspaceTheme.token).not.toHaveProperty('fontSizeSM');
    expect(compactProTableProps).toMatchObject({
      defaultSize: 'small',
      search: { style: { padding: 12 } },
      cardProps: { bodyStyle: { padding: 12 } },
      pagination: { size: 'small' },
    });
  });

  it.each([
    [themePalette.primary, themePalette.containerBackground],
    [themePalette.textPrimary, themePalette.containerBackground],
    [themePalette.textSecondary, themePalette.pageBackground],
    [themePalette.navigationText, themePalette.navigation],
    [themePalette.navigationSelected, themePalette.navigation],
    [themePalette.info, themePalette.containerBackground],
    [themePalette.infoText, themePalette.infoSurface],
    [themePalette.primaryActive, themePalette.selectedBackground],
    [themePalette.warningText, themePalette.warningSurface],
    [themePalette.errorText, themePalette.errorSurface],
  ])('keeps critical text pair %s on %s at WCAG AA contrast', (text, bg) => {
    expect(contrastRatio(text, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
