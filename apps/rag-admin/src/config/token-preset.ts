import type { ThemeConfig } from '@aplus-frontend/antdv/es/config-provider/context';
import type {
  BaseToken,
  FullToken,
} from '@aplus-frontend/ui/lib/src/design-token/interface';
import type { RecursivePartial } from '@aplus-frontend/ui/lib/src/type';
import { aplusModifyVars, transferOpacityColor } from './theme-color-token';

const commonToken: ThemeConfig['token'] = {
  borderRadius: 4,
  fontSize: 12,
  sizeStep: 4,
  lineHeight: 1.5,
  lineHeightSM: 1.6,
  wireframe: false,
  sizeUnit: 3,
};

/** RAG Admin 的 Ant Design token 覆盖。 */
export const antvToken: ThemeConfig['token'] = {
  ...commonToken,
  colorPrimary: aplusModifyVars['@primary-color'],
  colorPrimaryHover: aplusModifyVars['@primary-hover-color'],
  colorPrimaryActive: aplusModifyVars['@primary-active-color'],
  colorTextBase: aplusModifyVars['@text-primary-color'],
  colorText: aplusModifyVars['@text-primary-color'],
  colorTextSecondary: aplusModifyVars['@text-secondary-color'],
  colorTextTertiary: aplusModifyVars['@text-tertiary-color'],
  colorTextPlaceholder: aplusModifyVars['@text-placeholder-color'],
  colorBorder: aplusModifyVars['@border-color'],
  colorSplit: aplusModifyVars['@divider-color'],
  colorInfo: aplusModifyVars['@blue-color'],
  colorSuccess: aplusModifyVars['@green-color'],
  colorError: aplusModifyVars['@red-color'],
  colorWarning: aplusModifyVars['@orange-color'],
  colorBgContainerDisabled: aplusModifyVars['@input-disabled-color'],
  wireframe: false,
  colorBgLayout: aplusModifyVars['@fill-hover-color'],
  colorBgSpotlight: aplusModifyVars['@color-bg-spotlight-color'],
  controlItemBgActive: transferOpacityColor(
    aplusModifyVars['@primary-color'],
    '0.08'
  ),
  controlItemBgActiveHover:
    aplusModifyVars['@control-item-bg-active-hover-color'],
  colorBorderSecondary: aplusModifyVars['@divider-color'],
  controlOutline: 'none',
};

const aplusUIBaseToken: Partial<BaseToken> = {
  borderColorBase: aplusModifyVars['@border-color'],
  hoverColorBase: aplusModifyVars['@primary-hover-color'],
  activeColorBase: aplusModifyVars['@primary-active-color'],
  colorPrimary: aplusModifyVars['@primary-color'],
  colorPrimaryDisabled: aplusModifyVars['@primary-disabled-color'],
  colorLink: aplusModifyVars['@blue-color'],
  colorLinkHover: aplusModifyVars['@blue-hover-color'],
  colorLinkDisabled: aplusModifyVars['@blue-disabled-color'],
  colorSuccess: aplusModifyVars['@green-color'],
  colorSuccessDisabled: aplusModifyVars['@green-disabled-color'],
  colorError: aplusModifyVars['@red-color'],
  colorErrorDisabled: aplusModifyVars['@red-disabled-color'],
  colorWarn: aplusModifyVars['@orange-color'],
  colorWarnDisabled: aplusModifyVars['@orange-disabled-color'],
  textColor1: aplusModifyVars['@text-primary-color'],
  textColor2: aplusModifyVars['@text-secondary-color'],
  textColor3: aplusModifyVars['@text-tertiary-color'],
  textColor4: aplusModifyVars['@text-tertiary-color'],
  colorBg1: aplusModifyVars['@fill-bg-color'],
  colorBg2: aplusModifyVars['@color-bg2-color'],
  colorBg3: aplusModifyVars['@color-bg3-color'],
  colorBgDisabled: aplusModifyVars['@color-bg-disabled-color'],
  scrollbarThumbColorBase: aplusModifyVars['@scrollbar-color'],
  scrollbarThumbColorHover: aplusModifyVars['@scrollbar-hover-color'],
  scrollbarTrackColorHover: aplusModifyVars['@scrollbar-hover-color'],
  tableHeaderBg: aplusModifyVars['@table-header-bg-color'],
  colorBgLayout: aplusModifyVars['@color-bg-layout-color'],
};

/** RAG Admin 的 APlus-UI Design Token 预设。 */
export const aplusUITokenPreset: RecursivePartial<FullToken> = {
  ...aplusUIBaseToken,
  components: {
    BatchInputGroup: {
      batchInputGroupTriggerColorDisabled:
        aplusModifyVars['@batch-input-group-trigger-color-disabled-color'],
    },
    ApRadioGroup: {
      apRadioGroupItemActiveBgColor: transferOpacityColor(
        aplusModifyVars['@primary-color'],
        '0.1'
      ),
    },
    ApGrid: {
      apGridFixedScrollingBoxShadowColor:
        aplusModifyVars['@ap-grid-fixed-scrolling-box-shadow-color-color'],
    },
    ApForm: {
      apFormModalFooterBorderTop: `1px solid ${aplusModifyVars['@divider-color']}`,
    },
  },
};
