import { CardDataType, FeishuCard } from './feishu-card';

export type PublishCardWaitingData = {
  workflowEnv: string;
  content: string;
  status: string;
  testUser: string;
  operator: {
    id: string;
  };
  runId: string;
  links: Record<string, any>[];
  btnDisabled: boolean;
};

export enum PublishStatusEnum {
  testAudit = '测试卡点',
  // resolved = '部署中',
  success = '发布成功',
}

export default class ProjectPublishWaitingCard extends FeishuCard {
  static readonly templateId = 'AAqvo4o68JvgT';
  static readonly templateVersion = '1.0.6';

  /**
   * 构建飞书卡片消息
   * @param alertInfo
   * @returns
   */
  static buildCardMsg = (info: PublishCardWaitingData) => {
    return super.build(
      {
        ...info,
        statusOptions: PublishStatusEnum[info.status],
      },
      false,
    ) as CardDataType<PublishCardWaitingData>;
  };

  /**
   * 构建飞书卡片消息
   * @param info
   * @returns
   */
  static buildCardStringMsg = (info: PublishCardWaitingData) => {
    return super.build({
      ...info,
      statusOptions: PublishStatusEnum[info.status],
    });
  };
}
