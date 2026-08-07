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
  Green = '#1A9C72',
  GreenDisabled = '#EAFAF5',
  Red = '#D9363E',
  RedDisabled = '#FFEDED',
  Orange = '#D97706',
  FillHover = '#F3F5F8',
  FillBg = '#F7F8FA',
  SiderDarkBg = '#18202D',
  SiderBrandBg = '#9EE6C7',
  SiderBrandText = '#EEF3F8',
  CardBg = '#FFFFFF',
  TableHeaderBg = '#F7F9FA',
  Scrollbar = '#C8D1DE',
  ScrollbarHover = '#959CA7'
}

function camelToKebab(value: string): string {
  return `${value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}-color`;
}

export const aplusModifyVars = Object.fromEntries(
  Object.entries(ThemeColor).map(([key, value]) => [
    `@${camelToKebab(key)}`,
    value
  ])
) as Record<string, string>;
