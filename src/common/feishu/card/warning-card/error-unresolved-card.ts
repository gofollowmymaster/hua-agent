import { FeishuCard } from '../feishu-card';
import { IssueStatusEnum, UnresolvedCardData } from './interface';

export type IssueStatus = keyof typeof IssueStatusEnum;

export default class ErrorUnresolvedCard extends FeishuCard {
  static readonly templateId = 'AAqz6VqUmrfDw';
  static readonly templateVersion = '1.0.23';

  /**
   * 构建飞书报警卡片消息
   * @param alertInfo
   * @returns
   */
  static buildCardMsg = (alertInfo: UnresolvedCardData) => {
    return super.build({
      ...alertInfo,
      statusOptions: ErrorUnresolvedCard.statusOptions(alertInfo.status) || [],
      color: ErrorUnresolvedCard.getColor(alertInfo.status),
    });
  };
  static getColor(status: IssueStatusEnum) {
    return {
      待处理: 'red',
      重新激活: 'red',
      处理中: 'red',
      已解决: 'yellow',
      暂时忽略: 'yellow',
      已关闭: 'green',
    }[status];
  }
  static statusOptions(status: IssueStatusEnum) {
    return {
      待处理: [
        {
          text: '处理中',
          value: 'progressing',
        },
        {
          text: '暂时忽略',
          value: 'ignoreCount100',
        },
      ],
      处理中: [
        {
          text: '暂时忽略',
          value: 'ignoreCount100',
        },
        {
          text: '已解决',
          value: 'resolved',
        },
      ],
    }[status];
  }
}
