export enum ErrorLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}
export class BaseAlertEvent {
  timestamp: number;
  issueId: string;
  title: string;
  culprit: string;
  type: string;
  issueUrl: string;
  level: ErrorLevel;
  feishuUrl?: string;
  rawData?: Record<string, any>;
}
