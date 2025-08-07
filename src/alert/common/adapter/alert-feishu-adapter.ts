import {
  ApiAlertIssueTableDto,
  ApiAlertTableDto,
  FrontendAlertIssueTableDto,
  FrontendAlertTableDto,
} from '../type/alert-table';
import { apiModuleBuMap } from '../../alert-message/app-user-map';
import { ErrorEndpoint, RequestData } from '@src/alert/common/type/alert';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { Injectable } from '@nestjs/common';
import { AlertEvent } from '@src/alert/common/type/alert';
import { CommonCardData } from '@src/common/feishu/card/alert-card';
import {
  issueStatusMap,
  UnresolvedCardData,
} from '@src/common/feishu/card/error-unresolve-card';
import dayjs from 'dayjs';

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

  toApiAlertTableData(): ApiAlertTableDto {
    const bu = apiModuleBuMap[this.event.serverModuleName] || this.appInfo.bu;
    return {
      接口地址: this.requestData.url,
      http状态码: '200',
      业务状态码: this.requestData.code + '',
      请求参数: JSON.stringify(this.requestData.payload),
      响应数据: JSON.stringify(this.requestData.resData),
      错误信息: this.requestData.message,
      业务线: bu,
      发生时间: this.event.timestamp * 1000,
      环境: this.event.environment,
      RawData: JSON.stringify(this.event),
    };
  }

  toApiAlertIssueTableData(): ApiAlertIssueTableDto {
    const bu = apiModuleBuMap[this.event.pageModuleName] || this.appInfo.bu;
    return {
      接口地址: this.requestData.url,
      业务状态码: this.requestData.code + '',
      // 请求参数: JSON.stringify(this.requestData.payload),
      // 响应数据: JSON.stringify(this.requestData.resData),
      错误信息: this.requestData.message,
      业务线: bu,
      发生时间: this.event.timestamp * 1000,
      环境: this.event.environment,
      错误原因: '',
      解决方案: '',
      负责人: [{ id: this.appInfo.backendLeaderId }],
      错误次数: 1,
      IssueId: this.event.issueId,
      是否解决: false,
    };
  }

  toFrontendAlertTableData(): FrontendAlertTableDto {
    return {
      标题: this.event.title,
      链接信息: this.event.webUrl,
      // 是否解决: false,
      // 负责人: [{ id: appInfo.userId }],
      // 错误原因: '',
      // 解决方案: '',
      来源: 'Sentry告警',
      报警级别: this.event.level,
      描述信息: this.event.culprit,
      应用名: [this.event.pageModuleName],
      业务线: this.appInfo.bu,
      环境: this.event.environment,
      RawData: JSON.stringify(this.event),
    };
  }
  toFrontendAlertIssueTableData(): FrontendAlertIssueTableDto {
    return {
      标题: this.event.title,
      链接信息: this.event.webUrl,
      是否解决: false,
      负责人: [{ id: this.appInfo.frontendLeaderId }],
      错误原因: '',
      解决方案: '',
      来源: 'Sentry告警',
      报警级别: this.event.level,
      描述信息: this.event.culprit,
      应用名: [this.event.pageModuleName],
      业务线: this.appInfo.bu,
      环境: this.event.environment,
      错误次数: 1,
      IssueId: this.event.issueId,
    };
  }
  toCommonCardeData(): CommonCardData {
    return {
      environment: this.event.environment,
      rawData: '',
      userEmail: '',
      project: this.event.pageModuleName,
      linkUrl: this.event.webUrl,
      level: this.event.level,
      errorType: this.event.type,
      content: this.event.culprit,
      timestamp: this.event.timestamp,
    };
  }
  toAplusAlertCardeData(): UnresolvedCardData {
    return {
      userId:
        this.event.errorEndpoint == ErrorEndpoint.Server
          ? this.appInfo.backendLeaderId
          : this.appInfo.frontendLeaderId,
      title: this.event.level == 'fatal' ? '高危报警' : '异常报警',
      environment: this.event.environment,
      errorType: this.event.type,
      errorMessage: this.event.title,
      userName: this.appInfo.frontendLeaderName,
      project: this.event.pageModuleName,
      outerLink: this.event.webUrl,
      linkUrl: this.event.feishuUrl,
      level: this.event.level,
      eventType: this.event.type,
      abstract: this.event.culprit,
      content: this.event.title,
      count: 1,
      status: issueStatusMap['unresolved'],
      issueId: this.event.issueId,
      errorTime: dayjs(this.event.timestamp * 1000).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
    };
  }
}
