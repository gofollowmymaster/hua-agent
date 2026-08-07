import type { ThemeConfig } from '@aplus-frontend/antdv/es/config-provider/context';
import { aplusModifyVars } from './theme-color-token';

export const antvToken: ThemeConfig['token'] = {
  borderRadius: 4,
  fontSize: 12,
  colorPrimary: aplusModifyVars['@primary-color'],
  colorPrimaryHover: aplusModifyVars['@primary-hover-color'],
  colorPrimaryActive: aplusModifyVars['@primary-active-color'],
  colorText: aplusModifyVars['@text-primary-color'],
  colorTextSecondary: aplusModifyVars['@text-secondary-color'],
  colorTextTertiary: aplusModifyVars['@text-tertiary-color'],
  colorTextPlaceholder: aplusModifyVars['@text-placeholder-color'],
  colorBorder: aplusModifyVars['@border-color'],
  colorSplit: aplusModifyVars['@divider-color'],
  colorSuccess: aplusModifyVars['@green-color'],
  colorError: aplusModifyVars['@red-color'],
  colorWarning: aplusModifyVars['@orange-color'],
  colorBgLayout: aplusModifyVars['@fill-hover-color'],
  colorBgContainer: aplusModifyVars['@card-bg-color'],
  wireframe: false
};
