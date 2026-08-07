import type { ApTableSettingType } from '@aplus-frontend/ui';

export interface TableTopRefreshConfig {
  refresh: () => void;
  tooltip?: string;
  visible?: boolean;
}

export interface TableTopActionBarProps {
  selectedRowKeys: (string | number)[];
  clearAll: () => void;
  settings?: ApTableSettingType & {
    persistenceKey: string;
    hidden?: boolean;
  };
  refreshConfig?: TableTopRefreshConfig;
  showSelected?: boolean;
}

export type TableTopSettingGroupProps = Pick<
  TableTopActionBarProps,
  'settings' | 'refreshConfig'
>;
