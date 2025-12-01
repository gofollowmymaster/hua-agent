import { FeishuCard } from './feishu-card';

export type PublishCardData = {
  workflowEnv: string;
  content: string;
  status: string;
  testUser: string;
  operator: {
    id: string;
  };
  links: Record<string, any>[];
};

export enum PublishStatusEnum {
  testAudit = '测试卡点',
  // resolved = '部署中',
  success = '发布成功',
}

export default class ProjectPublishCard extends FeishuCard {
  static readonly templateId = 'AAqhnloJKZiwk';
  static readonly templateVersion = '1.0.2';

  /**
   * 构建飞书卡片消息
   * @param alertInfo
   * @returns
   */
  static buildCardMsg = (info: PublishCardData) => {
    return super.build({
      ...info,
      statusOptions: PublishStatusEnum[info.status],
      // color: ErrorUnresolvedCard.getColor(alertInfo.status),
    });
  };
}
