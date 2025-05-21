import { FeishuCard } from './feishu-card';

export type AlertInfo = {
  project: string;
  level?: string;
  errorMessage: string;
  linkUrl?: string;
  userId?: string;
  errorTime: string;
  title: string;
  color: string;
  culprit?: string;
  [key: string]: any;
};
export class FeishuAlertCard extends FeishuCard {
  protected static AlertTemplateId = 'AAqSyNBCovM2j';
  protected static AlertTemplateVersion = '1.0.9';

  /**
   * 构建飞书报警卡片消息
   * @param alertInfo
   * @returns
   */
  static buildCardMsg = (alertInfo: AlertInfo) => {
    const color = alertInfo.level == 'fatal' ? 'red' : 'orange';

    return super.build({ ...alertInfo, color });
  };

  //   buildAtUserMsg = (data: Record<string, any>, userId: string) => {
  //     const AtUser = userId ? `<at user_id="${userId}"></at>` : '';
  //     const content = {
  //       text: `${AtUser}`,
  //     };
  //     return JSON.stringify(content);
  //   };
}
