import { FeishuCard } from './feishu-card';

export type StatisticCardData = {
  date: string;
  total: number;
  resolved: number;
  ignored: number;
  unresolved: number;
  tableData: Record<string, any>[];
  color: string;
  [key: string]: any;
};

export default class ErrorStatisticCard extends FeishuCard {
  static readonly templateId = 'AAqz7GFur0NrV';
  static readonly templateVersion = '1.0.4';

  /**
   * 构建飞书报警卡片消息
   * @param alertInfo
   * @returns
   */
  static buildCardMsg = (alertInfo: StatisticCardData) => {
    return super.build({
      ...alertInfo,
    });
  };
}
