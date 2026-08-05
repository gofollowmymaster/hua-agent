/** Single source of truth for RAG Admin theme colors. */
export enum ThemeColor {
  Primary = '#0070FF',
  PrimaryHover = '#66A9FF',
  PrimaryActive = '#338CFF',
  PrimaryDisabled = '#CCE2FF',
  TextPrimary = '#182948',
  TextSecondary = '#526A90',
  TextTertiary = '#8896B0',
  TextPlaceholder = '#ABB7CC',
  Border = '#DEE4ED',
  Divider = '#E9EDF3',
  Blue = '#0070ff',
  BlueHover = '#66A9ff',
  BlueDisabled = '#E5F0FF',
  Green = '#2ED1A3',
  GreenDisabled = '#EAFAF5',
  Red = '#FF4D4F',
  RedDisabled = '#FFEDED',
  Orange = '#FFA940',
  OrangeDisabled = '#FFF6EB',
  Gray = '#ABB7cc',
  Purple = '#6B15FF',
  Scrollbar = '#c8d1de',
  ScrollbarHover = '#959ca7',
  TableHeaderBg = '#F7F9FA',
  InputDisabled = '#F2F6F9',
  FillHover = '#F3F5F8',
  FillBg = '#F7F8FA',
  FillDisabled = '#F9F9FA',
  FillGlobalBg = '#F2F6f9',
  SiderBg = '#FFFFFF',
  HeaderBg = '#062773',
  AvatarBg = `linear-gradient(
  0deg,
  #5b81eb 0%,
  #9fffff 100%
)`,
  DrawerShadow = '8px 2px 24px 0px rgba(24, 41, 72, 0.2)',
  CardBg = '#ffffff',
  ColorBg2 = '#f6f9fa',
  ColorBg3 = '#f5f5f5',
  ColorBgDisabled = ThemeColor.ColorBg3,
  ColorBgLayout = ThemeColor.ColorBg3,
  ColorBgSpotlight = '#000000cc',
  ControlItemBgActiveHover = '#EAF2FF',
  BatchInputGroupTriggerColorDisabled = 'rgba(0, 0, 0, 0.25)',
  ApGridFixedScrollingBoxShadowColor = '#e5e5e5',
}

function camelToKebab(value: string): string {
  return `${value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}-color`;
}

/** Less variables generated from ThemeColor. */
export const aplusModifyVars = Object.fromEntries(
  Object.entries(ThemeColor).map(([key, value]) => [
    `@${camelToKebab(key)}`,
    value
  ])
) as Record<string, string>;

/** Convert a hex or rgb color to rgba with the given opacity. */
export const transferOpacityColor = (
  color?: string,
  opacity: string = '0.7'
) => {
  try {
    const normalized = color?.toLowerCase();
    const hexPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/;

    if (normalized && hexPattern.test(normalized)) {
      let hex = normalized;
      if (hex.length === 4) {
        hex = `#${hex
          .slice(1)
          .split('')
          .map((item) => item + item)
          .join('')}`;
      }

      const rgb = [1, 3, 5].map((start) =>
        parseInt(hex.slice(start, start + 2), 16)
      );
      return `rgba(${rgb.join(',')},${opacity})`;
    }

    if (normalized?.startsWith('rgb')) {
      const numbers = normalized.match(/(\d(\.\d+)?)+/g);
      if (numbers) {
        const rgb = numbers.slice(0, 3);
        return `rgba(${rgb.join(',')},${opacity})`;
      }
    }

    return color;
  } catch {
    return undefined;
  }
};
