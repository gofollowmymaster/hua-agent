export class SentryAlertDto {
  environment: string; //事件环境,

  rawData: string; //完整 JSON 字符串,

  errorMessage: string; //事件标题,

  userEmail: string; //事件用户邮箱,

  project: string; //项目,

  linkUrl: string; //URL,

  level: string; //报警级别,

  eventType: string; //事件类型,

  culprit: string; //打点摘要,

  timeStamp: number; //事件发布时间戳
}

export class ReadMsgCallbackDto {
  schema: string;

  header: Record<string, any>;

  event: Record<string, any>;
}
