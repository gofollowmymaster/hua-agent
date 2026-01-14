import { FeishuCard } from '../feishu-card';
import { IssueStatusEnum } from './interface';

type StatusOption = {
  text: string;
  value: string;
};

export type UnresolvedCardData = {
  linkUrl?: string;
  userId?: string;
  content: string;
  title: string;
  color?: string;
  count?: number;
  status: IssueStatusEnum;
  issueId: string;
  statusOptions: StatusOption[];
  [key: string]: any;
};

export default class WarningCard extends FeishuCard {
  static readonly templateId = 'AAqvFnIF0Qunq';
  static readonly templateVersion = '1.0.1';

  /**
   * 构建飞书报警卡片消息
   * @param alertInfo
   * @returns
   */
  static buildCardMsg = (alertInfo: UnresolvedCardData) => {
    return super.build({
      ...alertInfo,
      statusOptions: WarningCard.statusOptions(alertInfo.status) || [],
      color: WarningCard.getColor(alertInfo.status),
    });
  };
  static getColor(status: IssueStatusEnum) {
    return {
      待处理: 'red',
      重新激活: 'red',
      处理中: 'red',
      暂时忽略: 'yellow',
      已解决: 'green',
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
