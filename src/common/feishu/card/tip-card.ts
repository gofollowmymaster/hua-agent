import { FeishuCard } from './feishu-card';

export type PublishCardData = {
  title: string;
  bgColor: string;
  content: string;
};

export default class TipCard extends FeishuCard {
  static readonly templateId = 'AAqhoxz52uFdU';
  static readonly templateVersion = '1.0.0';

  /**
   * 构建飞书卡片消息
   * @param alertInfo
   * @returns
   */
  static buildCardMsg = (info: PublishCardData) => {
    return super.build({
      ...info,
    });
  };
}
