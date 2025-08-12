import { IssueStatus } from './error-unresolve-card';
import { FeishuCard } from './feishu-card';

export type ResolvedCardData = {
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
  status: IssueStatus;
  issueId: string;
  environment: string;
  [key: string]: any;
};

export default class ErrorClosedCard extends FeishuCard {
  static readonly templateId = 'AAqz0I0RCKyBk';
  static readonly templateVersion = '1.0.3';

  /**
   * 构建飞书报警卡片消息
   * @param alertInfo
   * @returns
   */
  static buildCardMsg = (alertInfo: ResolvedCardData) => {
    return super.build({
      ...alertInfo,
    });
  };
}
