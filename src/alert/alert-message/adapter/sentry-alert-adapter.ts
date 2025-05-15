import { ApiAlertTableDto, FrontendAlertTableDto } from './alert-table-dto';
import { SentryAlertDto } from '../dto/sentry-alert.dto';
import { SentryRawDto } from '../dto/sentry-raw.dto';
import { appUserMap } from '../app-user-map';

export default class SentryApiAlertAdapter {
  private sentryData: SentryRawDto;
  constructor(sentryData: SentryRawDto) {
    this.sentryData = sentryData;
  }

  toApiAlertTableData(): ApiAlertTableDto {
    const requestData = this.sentryData.event.extra?.__serialized__;
    const subAppName =
      this.sentryData.event.extra?.subModuleName || this.sentryData.project;
    // const
    return {
      接口地址: requestData.url,
      http状态码: '200',
      业务状态码: requestData.code + '',
      请求参数: JSON.stringify(requestData.payload),
      响应数据: JSON.stringify(requestData.resData),
      错误信息: requestData.message,
      业务线: [appUserMap[subAppName]?.bu],
      应用名: [subAppName + ''],
      发生时间: this.sentryData.event.timestamp * 1000,
      环境: this.sentryData.event.environment,

      RawData: JSON.stringify(this.sentryData),
    };
  }

  toFrontendAlertTableData(): FrontendAlertTableDto {
    // const requestData = this.sentryData.event.extra.__serialized__;
    const subAppName =
      this.sentryData.event.extra?.subModuleName || this.sentryData.project;

    // const
    return {
      标题: this.sentryData.message,
      链接信息: this.sentryData.url,
      是否解决: false,
      // 优先级: requestData.payload,
      负责人: [{ id: appUserMap[subAppName]?.userId }],
      错误原因: '',
      解决方案: '',
      来源: 'Sentry告警',
      报警级别: this.sentryData.level,
      描述信息: this.sentryData.culprit,
      应用名: [subAppName],
      业务线: [appUserMap[subAppName]?.bu],
      环境: this.sentryData.event.environment,
      RawData: JSON.stringify(this.sentryData),
    };
  }
  toFeishuMessageData(): SentryAlertDto {
    const sentryData = this.sentryData;
    const subAppName =
      this.sentryData.event.extra?.subModuleName || this.sentryData.project;

    return {
      environment: sentryData.event.environment,
      rawData: JSON.stringify(sentryData),
      errorMessage: sentryData.message,
      userEmail: '',
      project: subAppName,
      linkUrl: sentryData.url,
      level: sentryData.level,
      eventType: sentryData.event.type,
      culprit: sentryData.culprit,
      timeStamp: sentryData.event.timestamp,
    };
  }
}
