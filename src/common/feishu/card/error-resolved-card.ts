import { FeishuCard } from './feishu-card';
import { IssueStatusEnum } from './error-unresolve-card';

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
  status: IssueStatusEnum;
  issueId: string;
  environment: string;
  [key: string]: any;
};

export default class ErrorResolvedCard extends FeishuCard {
  static readonly templateId = 'AAqzwZgGpWfzJ';
  static readonly templateVersion = '1.0.11';

  /**
   * 构建飞书报警卡片消息
   * @param alertInfo
   * @returns
   */
  static buildCardMsg = (alertInfo: ResolvedCardData) => {
    // const color = alertInfo.level == 'fatal' ? 'red' : 'orange';
    // const title = alertInfo.level == 'fatal' ? '高危报警' : '异常报警';

    return super.build({
      ...alertInfo,
    });
  };
}
