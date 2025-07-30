import {
  ApiAlertIssueTableDto,
  ApiAlertTableDto,
  FrontendAlertIssueTableDto,
  FrontendAlertTableDto,
} from './alert-table-dto';
import { SentryAlertDto } from '../dto/sentry-alert.dto';
import { apiModuleBuMap } from '../app-user-map';
import { SentryEvent, SubAppName } from '@src/alert/type/sentry';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class SentryAlertAdapter {
  private sentryEvent: SentryEvent;
  private requestData: any;
  private subAppName: SubAppName;
  private appInfo: any;
  private moduleName: string;
  constructor(
    private readonly feishuBusinessLineTable: FeishuBusinessLineTable,
  ) {}
  async setEventryEvent(sentryEvent: SentryEvent) {
    this.requestData = sentryEvent.extra?.__serialized__;
    this.subAppName = sentryEvent.extra?.subModuleName;
    this.appInfo = await this.feishuBusinessLineTable.getBusinessLineBySubapp(
      this.subAppName,
    );

    this.moduleName = this.getModuleNameByUrl(this.requestData.url);

    this.sentryEvent = sentryEvent;
  }

  getModuleNameByUrl(url: string = '') {
    if (!url) return;
    url = url.replace('https://', '');
    url = url.replace('/api/', '/');
    const urlArr = url.split('/');
    return urlArr[1];
  }

  async toApiAlertTableData(): Promise<ApiAlertTableDto> {
    const bu = apiModuleBuMap[this.moduleName] || this.appInfo.bu;
    return {
      接口地址: this.requestData.url,
      http状态码: '200',
      业务状态码: this.requestData.code + '',
      请求参数: JSON.stringify(this.requestData.payload),
      响应数据: JSON.stringify(this.requestData.resData),
      错误信息: this.requestData.message,
      业务线: [bu],
      // 应用名: this.subAppName + '',
      发生时间: this.sentryEvent.timestamp * 1000,
      环境: this.sentryEvent.environment,
      RawData: JSON.stringify(this.sentryEvent),
    };
  }

  async toApiAlertIssueTableData(): Promise<ApiAlertIssueTableDto> {
    const bu = apiModuleBuMap[this.moduleName] || this.appInfo.bu;
    return {
      接口地址: this.requestData.url,
      业务状态码: this.requestData.code + '',
      请求参数: JSON.stringify(this.requestData.payload),
      响应数据: JSON.stringify(this.requestData.resData),
      错误信息: this.requestData.message,
      业务线: [bu],
      发生时间: this.sentryEvent.timestamp * 1000,
      环境: this.sentryEvent.environment,
      错误原因: '',
      解决方案: '',
      负责人: [{ id: this.appInfo.backendLeaderId }],
      错误次数: 1,
      IssueId: this.sentryEvent.issue_id,
      是否解决: false,
    };
  }

  async toFrontendAlertTableData(): Promise<FrontendAlertTableDto> {
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
      应用名: [this.subAppName],
      业务线: [this.appInfo.bu],
      环境: this.sentryEvent.environment,
      RawData: JSON.stringify(this.sentryEvent),
    };
  }
  async toFrontendAlertIssueTableData(): Promise<FrontendAlertIssueTableDto> {
    return {
      标题: this.sentryEvent.title,
      链接信息: this.sentryEvent.web_url,
      是否解决: false,
      负责人: [{ id: this.appInfo.frontendLeaderId }],
      错误原因: '',
      解决方案: '',
      来源: 'Sentry告警',
      报警级别: this.sentryEvent.level,
      描述信息: this.sentryEvent.culprit,
      应用名: [this.subAppName],
      业务线: [this.appInfo.bu],
      环境: this.sentryEvent.environment,
      错误次数: 1,
      IssueId: this.sentryEvent.issue_id,
    };
  }
  toFeishuMessageData(): SentryAlertDto {
    return {
      environment: this.sentryEvent.environment,
      rawData: '',
      errorMessage: this.sentryEvent.title,
      userEmail: '',
      project: this.subAppName,
      linkUrl: this.sentryEvent.web_url,
      level: this.sentryEvent.level,
      eventType: this.sentryEvent.type,
      culprit: this.sentryEvent.culprit,
      timeStamp: this.sentryEvent.timestamp,
    };
  }
}
