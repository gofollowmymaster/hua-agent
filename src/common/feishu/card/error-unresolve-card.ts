import dayjs from 'dayjs';
import { FeishuCard } from './feishu-card';

export type UnresolvedCardData = {
  project: string;
  level?: string;
  errorType: string;
  linkUrl?: string;
  userId?: string;
  timestamp: number;
  title: string;
  color?: string;
  content: string;
  count?: number;
  // status: IssueStatus;
  status: IssueStatus;
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
  static readonly templateVersion = '1.0.10';

  /**
   * 构建飞书报警卡片消息
   * @param alertInfo
   * @returns
   */
  static buildCardMsg = (alertInfo: UnresolvedCardData) => {
    const color = alertInfo.level == 'fatal' ? 'red' : 'orange';
    const title = alertInfo.level == 'fatal' ? '高危报警' : '异常报警';

    const status = issueStatusMap[alertInfo.status] || '未解决';
    const errorTime = dayjs(alertInfo.timestamp * 1000).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    return super.build({
      ...alertInfo,
      title,
      errorTime,
      color,
      status,
      count: 1,
    });
  };
}
