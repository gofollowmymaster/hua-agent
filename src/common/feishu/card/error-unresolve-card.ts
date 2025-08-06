import { FeishuCard } from './feishu-card';

export type UnresolvedCardData = {
  project: string;
  level?: string;
  errorType: string;
  linkUrl?: string;
  userId?: string;
  errorTime: string;
  title: string;
  color?: string;
  content: string;
  count?: number;
  // status: IssueStatus;
  status: IssueStatusLabel;
  issueId: string;
  environment: string;
  [key: string]: any;
};
export type IssueStatus = keyof typeof issueStatusMap;
// export type IssueStatusLabel = keyof typeof issueStatusMap;
export type IssueStatusLabel =
  (typeof issueStatusMap)[keyof typeof issueStatusMap];

export const issueStatusMap = {
  unresolved: '待处理',
  resolved: '已解决',
  ignoreCount100: '暂时忽略',
  ignoreCount1000: '已忽略',
  progressing: '处理中',
} as const;
export default class ErrorUnresolvedCard extends FeishuCard {
  static readonly templateId = 'AAqz6VqUmrfDw';
  static readonly templateVersion = '1.0.17';

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
  static getColor(status: IssueStatusLabel) {
    return {
      待处理: 'red',
      重新激活: 'red',
      处理中: 'red',
      已解决: 'yellow',
      暂时忽略: 'yellow',
      已关闭: 'green',
    }[status];
  }
  static statusOptions(status: IssueStatusLabel) {
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
