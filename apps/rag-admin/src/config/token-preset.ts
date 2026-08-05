import type { ThemeConfig } from '@aplus-frontend/antdv/es/config-provider/context';
import type {
  BaseToken,
  FullToken,
} from '@aplus-frontend/ui/lib/src/design-token/interface';
import type { RecursivePartial } from '@aplus-frontend/ui/lib/src/type';

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
  colorPrimary: '#0070FF',
  colorPrimaryHover: '#66A9FF',
  colorPrimaryActive: '#338CFF',
  colorTextBase: '#182948',
  colorText: '#182948',
  colorTextSecondary: '#526A90',
  colorTextTertiary: '#8896B0',
  colorTextPlaceholder: '#ABB7CC',
  colorBorder: '#DEE4ED',
  colorSplit: '#E9EDF3',
  colorInfo: '#0070ff',
  colorSuccess: '#2ED1A3',
  colorError: '#FF4D4F',
  colorWarning: '#FFA940',
  colorBgContainerDisabled: '#F2F6F9',
  wireframe: false,
  colorBgLayout: '#F3F5F8',
  colorBgSpotlight: '#000000cc',
  controlItemBgActive: 'rgba(0, 112, 255, 0.08)',
  controlItemBgActiveHover: '#EAF2FF',
  colorBorderSecondary: '#E9EDF3',
  controlOutline: 'none',
};

const aplusUIBaseToken: Partial<BaseToken> = {
  borderColorBase: '#DEE4ED',
  hoverColorBase: '#66A9FF',
  activeColorBase: '#338CFF',
  colorPrimary: '#0070FF',
  colorPrimaryDisabled: '#CCE2FF',
  colorLink: '#0070ff',
  colorLinkHover: '#66A9ff',
  colorLinkDisabled: '#E5F0FF',
  colorSuccess: '#2ED1A3',
  colorSuccessDisabled: '#EAFAF5',
  colorError: '#FF4D4F',
  colorErrorDisabled: '#FFEDED',
  colorWarn: '#FFA940',
  colorWarnDisabled: '#FFF6EB',
  textColor1: '#182948',
  textColor2: '#526A90',
  textColor3: '#8896B0',
  textColor4: '#8896B0',
  colorBg1: '#F7F8FA',
  colorBg2: '#f6f9fa',
  colorBg3: '#f5f5f5',
  colorBgDisabled: '#f5f5f5',
  scrollbarThumbColorBase: '#c8d1de',
  scrollbarThumbColorHover: '#959ca7',
  scrollbarTrackColorHover: '#959ca7',
  tableHeaderBg: '#F7F9FA',
  colorBgLayout: '#f5f5f5',
};

/** RAG Admin 的 APlus-UI Design Token 预设。 */
export const aplusUITokenPreset: RecursivePartial<FullToken> = {
  ...aplusUIBaseToken,
  components: {
    BatchInputGroup: {
      batchInputGroupTriggerColorDisabled: 'rgba(0, 0, 0, 0.25)',
    },
    ApRadioGroup: {
      apRadioGroupItemActiveBgColor: 'rgba(0, 112, 255, 0.1)',
    },
    ApGrid: {
      apGridFixedScrollingBoxShadowColor: '#e5e5e5',
    },
    ApForm: {
      apFormModalFooterBorderTop: '1px solid #E9EDF3',
    },
  },
};
