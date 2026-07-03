export enum IssueStatusEnum {
  unresolved = '待处理',
  resolved = '已解决',
  ignoreCount100 = '暂时忽略',
  // ignoreCount1000 = '已忽略',
  progressing = '处理中',
  reopened = '重新打开',
  closed = '已关闭',
}

type StatusOption = {
  text: string;
  value: string;
};

export class BaseWarningCardData {
  linkUrl?: string;
  userId?: string;
  content: string;
  title: string;
  color?: string;
  status: IssueStatusEnum;
  issueId: string;
  statusOptions?: StatusOption[];
  [key: string]: any;
}

export class UnresolvedCardData extends BaseWarningCardData {
  project: string;
  level?: string;
  errorType: string;
  errorTime: string;
  count?: number;
  environment: string;
  trackers: string;
  [key: string]: any;
}
