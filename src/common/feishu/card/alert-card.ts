import dayjs from 'dayjs';
import { FeishuCard } from './feishu-card';

export type CommonCardData = {
  project: string;
  level?: string;
  errorType: string;
  content: string;
  linkUrl?: string;
  userId?: string;
  timestamp?: number;
  title?: string;
  color?: string;
  [key: string]: any;
};
export class CommonAlertCard extends FeishuCard {
  protected static AlertTemplateId = 'AAqSyNBCovM2j';
  protected static AlertTemplateVersion = '1.0.10';

  /**
   * 构建飞书报警卡片消息
   * @param alertInfo
   * @returns
   */
  static buildCardMsg = (alertInfo: CommonCardData) => {
    const color =
      alertInfo.color || (alertInfo.level == 'fatal' ? 'red' : 'orange');
    const title =
      alertInfo.title || (alertInfo.level == 'fatal' ? '高危报警' : '异常报警');
    const timestamp =
      alertInfo.timestamp < 10000000000
        ? alertInfo.timestamp * 1000
        : alertInfo.timestamp;
    const errorTime = dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
    return super.build({ ...alertInfo, color, title, errorTime });
  };
}

export default CommonAlertCard;
