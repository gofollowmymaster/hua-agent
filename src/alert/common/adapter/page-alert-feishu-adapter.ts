import {
  FrontendAlertIssueTableDto,
  FrontendAlertTableDto,
} from '../type/alert-table';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { Injectable, Scope } from '@nestjs/common';
import { PageAlertEvent } from '@src/alert/common/type/alert';
import {
  IssueStatusEnum,
  UnresolvedCardData,
} from '@src/common/feishu/card/error-unresolve-card';
import dayjs from 'dayjs';
import BaseAlertFeishuAdapter from './base-alert-feishu-adapter';

@Injectable({ scope: Scope.REQUEST })
export default class PageAlertFeishuAdapter extends BaseAlertFeishuAdapter {
  protected event: PageAlertEvent;
  private appInfo: any;
  constructor(
    private readonly feishuBusinessLineTable: FeishuBusinessLineTable,
  ) {
    super();
  }
  async setEvent(event: PageAlertEvent) {
    this.appInfo = await this.feishuBusinessLineTable.getBusinessLineBySubapp(
      event.pageModuleName || 'others',
    );

    this.event = event;
  }

  toFrontendAlertTableData(): FrontendAlertTableDto {
    return {
      标题: this.event.title,
      链接信息: this.event.webUrl,
      // 是否解决: false,
      // 负责人: [{ id: appInfo.userId }],
      // 错误原因: '',
      // 解决方案: '',
      IssueId: this.event.issueId,
      来源: 'Sentry告警',
      报警级别: this.event.level,
      描述信息: this.event.culprit,
      应用名: [this.event.pageModuleName],
      业务线: this.appInfo.bu,
      环境: this.event.environment,
      RawData: JSON.stringify(this.event.rawData),
    };
  }
  toFrontendAlertIssueTableData(): FrontendAlertIssueTableDto {
    return {
      标题: this.event.title,
      // 链接信息: this.event.webUrl,
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
      日错误次数: 1,
      IssueId: this.event.issueId,
      外部链接: this.event.issueUrl,
      状态: IssueStatusEnum.unresolved,
    };
  }
  toAplusAlertCardeData(): UnresolvedCardData {
    return {
      userId: this.appInfo.frontendLeaderId,
      title: this.event.level == 'fatal' ? '高危报警' : '异常报警',
      environment: this.event.environment,
      errorType: this.event.type,
      errorMessage: this.event.title,
      userName: this.appInfo.frontendLeaderName,
      project: `[${this.event.project}]-${this.event.pageModuleName}`,
      outerLink: this.event.webUrl,
      linkUrl: this.event.feishuUrl,
      level: this.event.level,
      eventType: this.event.type,
      abstract: this.event.culprit,
      content:
        this.event.title.length < 20
          ? this.event.title + ' ' + this.event.message
          : this.event.title,
      count: 1,
      status: IssueStatusEnum['unresolved'],
      issueId: this.event.issueId,
      errorTime: dayjs(this.event.timestamp * 1000).format(
        'YYYY-MM-DD HH:mm:ss',
      ),

      messageId: undefined,
      errorEndpoint: this.event.errorEndpoint,
      trackers: '',
    };
  }
}
