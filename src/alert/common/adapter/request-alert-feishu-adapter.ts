import { ApiAlertIssueTableDto, ApiAlertTableDto } from '../type/alert-table';
import { RequestData } from '@src/alert/common/type/alert';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { Injectable, Scope } from '@nestjs/common';
import { RequestAlertEvent } from '@src/alert/common/type/alert';
import { UnresolvedCardData } from '@src/common/feishu/card/warning-card/error-unresolved-card';
import dayjs from 'dayjs';
import BaseAlertFeishuAdapter from './base-alert-feishu-adapter';
import { AlertContext } from '../service/alert-event.context';
import { IssueStatusEnum } from '@src/common/feishu/card/warning-card/interface';

export const apiModuleBuMap = {
  im: '基础架构',
  'download-center': '基础架构',
  wms: '仓储物流',
  bms: '业财一体',
  ad: '商家运营',
  'data-compare': '基础架构',
};

@Injectable({ scope: Scope.REQUEST })
export default class RequestAlertFeishuAdapter extends BaseAlertFeishuAdapter {
  protected event: RequestAlertEvent;
  protected requestData: RequestData;
  protected appInfo: any;
  constructor(
    private readonly feishuBusinessLineTable: FeishuBusinessLineTable,
    protected readonly alertContext: AlertContext,
  ) {
    super();
  }
  async setEvent(event: RequestAlertEvent) {
    this.requestData = event.requestData;
    this.appInfo = await this.feishuBusinessLineTable.getBusinessLineBySubapp(
      event.pageModuleName || 'others',
    );

    this.event = event;
  }

  async toApiAlertTableData(): Promise<ApiAlertTableDto> {
    await this.setEvent(this.alertContext.event as RequestAlertEvent);

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
      链接信息: this.event.webUrl,
      应用名: this.event.pageModuleName,
      IssueId: this.event.issueId,
      RawData: JSON.stringify(this.event.rawData),
    };
  }

  async toApiAlertIssueTableData(): Promise<ApiAlertIssueTableDto> {
    await this.setEvent(this.alertContext.event as RequestAlertEvent);
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
      日错误次数: 1,
      IssueId: this.event.issueId,
      外部链接: this.event.issueUrl,
      状态: IssueStatusEnum.unresolved,
    };
  }

  async toAplusAlertCardData(): Promise<UnresolvedCardData> {
    await this.setEvent(this.alertContext.event as RequestAlertEvent);

    return {
      userId: this.appInfo.backendLeaderId,
      title: this.event.level == 'fatal' ? '高危报警' : '异常报警',
      environment: this.event.environment,
      errorType: this.event.type,
      errorMessage: this.event.title,
      userName: this.appInfo.backendLeaderName,
      project: `[${this.event.project}]->${this.event.pageModuleName}`,
      outerLink: this.event.webUrl,
      linkUrl: this.event.feishuUrl,
      level: this.event.level,
      eventType: this.event.type,
      abstract: this.event.culprit,
      content:
        this.event.requestData?.message +
        ' traceId:' +
        this.event.requestData.resData?.traceId,
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
