import {
  ApiAlertIssueTableDto,
  ApiAlertTableDto,
  FrontendAlertIssueTableDto,
  FrontendAlertTableDto,
} from '../type/alert-table';
import { apiModuleBuMap } from '../../alert-message/app-user-map';
import { RequestData } from '@src/alert/common/type/alert';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { Injectable } from '@nestjs/common';
import { AlertEvent } from '@src/alert/common/type/alert';
import { CommonCardData } from '@src/common/feishu/card/alert-card';
import { UnresolvedCardData } from '@src/common/feishu/card/error-unresolve-card';

@Injectable()
export default class AlertFeishuAdapter {
  private event: AlertEvent;
  private requestData: RequestData;
  private appInfo: any;
  constructor(
    private readonly feishuBusinessLineTable: FeishuBusinessLineTable,
  ) {}
  async setEvent(event: AlertEvent) {
    this.requestData = event.requestData;
    this.appInfo = await this.feishuBusinessLineTable.getBusinessLineBySubapp(
      event.pageModuleName || 'others',
    );

    this.event = event;
  }

  async toApiAlertTableData(): Promise<ApiAlertTableDto> {
    const bu = apiModuleBuMap[this.event.serverModuleName] || this.appInfo.bu;
    return {
      接口地址: this.requestData.url,
      http状态码: '200',
      业务状态码: this.requestData.code + '',
      请求参数: JSON.stringify(this.requestData.payload),
      响应数据: JSON.stringify(this.requestData.resData),
      错误信息: this.requestData.message,
      业务线: [bu],
      发生时间: this.event.timestamp * 1000,
      环境: this.event.environment,
      RawData: JSON.stringify(this.event),
    };
  }

  async toApiAlertIssueTableData(): Promise<ApiAlertIssueTableDto> {
    const bu = apiModuleBuMap[this.event.pageModuleName] || this.appInfo.bu;
    return {
      接口地址: this.requestData.url,
      业务状态码: this.requestData.code + '',
      请求参数: JSON.stringify(this.requestData.payload),
      响应数据: JSON.stringify(this.requestData.resData),
      错误信息: this.requestData.message,
      业务线: [bu],
      发生时间: this.event.timestamp * 1000,
      环境: this.event.environment,
      错误原因: '',
      解决方案: '',
      负责人: [{ id: this.appInfo.backendLeaderId }],
      错误次数: 1,
      IssueId: this.event.issue_id,
      是否解决: false,
    };
  }

  async toFrontendAlertTableData(): Promise<FrontendAlertTableDto> {
    return {
      标题: this.event.title,
      链接信息: this.event.web_url,
      是否解决: false,
      // 负责人: [{ id: appInfo.userId }],
      错误原因: '',
      解决方案: '',
      来源: 'Sentry告警',
      报警级别: this.event.level,
      描述信息: this.event.culprit,
      应用名: [this.event.pageModuleName],
      业务线: [this.appInfo.bu],
      环境: this.event.environment,
      RawData: JSON.stringify(this.event),
    };
  }
  async toFrontendAlertIssueTableData(): Promise<FrontendAlertIssueTableDto> {
    return {
      标题: this.event.title,
      链接信息: this.event.web_url,
      是否解决: false,
      负责人: [{ id: this.appInfo.frontendLeaderId }],
      错误原因: '',
      解决方案: '',
      来源: 'Sentry告警',
      报警级别: this.event.level,
      描述信息: this.event.culprit,
      应用名: [this.event.pageModuleName],
      业务线: [this.appInfo.bu],
      环境: this.event.environment,
      错误次数: 1,
      IssueId: this.event.issue_id,
    };
  }
  toCommonCardeData(): CommonCardData {
    return {
      environment: this.event.environment,
      rawData: '',
      userEmail: '',
      project: this.event.pageModuleName,
      linkUrl: this.event.web_url,
      level: this.event.level,
      errorType: this.event.type,
      content: this.event.culprit,
      timestamp: this.event.timestamp,
    };
  }
  toUnresolvedCardeData(): UnresolvedCardData {
    return {
      userId: this.appInfo.frontendLeaderId,
      title: this.event.title,
      environment: this.event.environment,

      errorType: this.event.type,
      errorMessage: this.event.title,
      userName: this.appInfo.frontendLeaderName,
      project: this.event.pageModuleName,
      linkUrl: this.event.web_url,
      level: this.event.level,
      eventType: this.event.type,
      content: this.event.culprit,
      count: 1,
      status: 'unresolved',
      issueId: this.event.issue_id,
      timestamp: this.event.timestamp,
    };
  }
}
