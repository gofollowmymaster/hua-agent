import { describe, expect, it } from 'vitest';
import { resolveTenantAuthConfig } from '@/auth/tenant';
import { proLayoutTheme, reactAdminTheme, themePalette } from './index';

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
