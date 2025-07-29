import {
  ApiAlertIssueTableDto,
  ApiAlertTableDto,
  FrontendAlertIssueTableDto,
  FrontendAlertTableDto,
} from './alert-table-dto';
import { SentryAlertDto } from '../dto/sentry-alert.dto';
import { SentryEvent } from '../dto/sentry-raw.dto';
import { apiModuleBuMap, getSubAppInfo } from '../app-user-map';

export default class SentryApiAlertAdapter {
  private sentryEvent: SentryEvent;
  constructor(sentryEvent: SentryEvent) {
    this.sentryEvent = sentryEvent;
  }
  // updateSentry

  getModuleNameByUrl(url: string = '') {
    if (!url) return;
    url = url.replace('https://', '');
    url = url.replace('/api/', '/');
    const urlArr = url.split('/');
    return urlArr[1];
  }

  toApiAlertTableData(): ApiAlertTableDto {
    const requestData = this.sentryEvent.extra?.__serialized__;
    const subAppName = this.sentryEvent.extra?.subModuleName;
    const appInfo = getSubAppInfo(subAppName);

    const moduleName = this.getModuleNameByUrl(requestData.url);
    return {
      接口地址: requestData.url,
      http状态码: '200',
      业务状态码: requestData.code + '',
      请求参数: JSON.stringify(requestData.payload),
      响应数据: JSON.stringify(requestData.resData),
      错误信息: requestData.message,
      业务线: [apiModuleBuMap[moduleName] || appInfo.bu],
      应用名: subAppName + '',
      发生时间: this.sentryEvent.timestamp * 1000,
      环境: this.sentryEvent.environment,
      RawData: JSON.stringify(this.sentryEvent),
    };
  }

  toApiAlertIssueTableData(): ApiAlertIssueTableDto {
    const requestData = this.sentryEvent.extra?.__serialized__;
    const subAppName = this.sentryEvent.extra?.subModuleName;
    const appInfo = getSubAppInfo(subAppName);

    const moduleName = this.getModuleNameByUrl(requestData.url);
    return {
      接口地址: requestData.url,
      业务状态码: requestData.code + '',
      请求参数: JSON.stringify(requestData.payload),
      响应数据: JSON.stringify(requestData.resData),
      错误信息: requestData.message,
      业务线: [apiModuleBuMap[moduleName] || appInfo.bu],
      应用名: subAppName + '',
      发生时间: this.sentryEvent.timestamp * 1000,
      环境: this.sentryEvent.environment,
      错误原因: '',
      解决方案: '',
      负责人: [{ id: appInfo.userId }],
      错误次数: 1,
      IssueId: this.sentryEvent.issue_id,
      是否解决: false,
    };
  }

  toFrontendAlertTableData(): FrontendAlertTableDto {
    const subAppName = this.sentryEvent.extra?.subModuleName;
    const appInfo = getSubAppInfo(subAppName);
    return {
      标题: this.sentryEvent.title,
      链接信息: this.sentryEvent.web_url,
      是否解决: false,
      // 负责人: [{ id: appInfo.userId }],
      错误原因: '',
      解决方案: '',
      来源: 'Sentry告警',
      报警级别: this.sentryEvent.level,
      描述信息: this.sentryEvent.culprit,
      应用名: [subAppName],
      业务线: [appInfo.bu],
      环境: this.sentryEvent.environment,
      RawData: JSON.stringify(this.sentryEvent),
    };
  }
  toFrontendAlertIssueTableData(): FrontendAlertIssueTableDto {
    const subAppName = this.sentryEvent.extra?.subModuleName;
    const appInfo = getSubAppInfo(subAppName);
    return {
      标题: this.sentryEvent.title,
      链接信息: this.sentryEvent.web_url,
      是否解决: false,
      负责人: [{ id: appInfo.userId }],
      错误原因: '',
      解决方案: '',
      来源: 'Sentry告警',
      报警级别: this.sentryEvent.level,
      描述信息: this.sentryEvent.culprit,
      应用名: [subAppName],
      业务线: [appInfo.bu],
      环境: this.sentryEvent.environment,
      错误次数: 1,
      IssueId: this.sentryEvent.issue_id,
    };
  }
  toFeishuMessageData(): SentryAlertDto {
    const sentryEvent = this.sentryEvent;
    const subAppName = this.sentryEvent.extra?.subModuleName;

    // const sentryEvent.url

    return {
      environment: sentryEvent.environment,
      rawData: '',
      errorMessage: sentryEvent.title,
      userEmail: '',
      project: subAppName,
      linkUrl: sentryEvent.web_url,
      level: sentryEvent.level,
      eventType: sentryEvent.type,
      culprit: sentryEvent.culprit,
      timeStamp: sentryEvent.timestamp,
    };
  }
}
