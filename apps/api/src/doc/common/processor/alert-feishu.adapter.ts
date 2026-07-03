import { Injectable } from '@nestjs/common';
import BaseAlertFeishuAdapter from '@src/alert/common/adapter/base-alert-feishu-adapter';
import { AlertContext } from '@src/common/base/alert-event.context';
import { BaseAlertEvent } from '@src/common/base/interface';
import {
  BaseWarningCardData,
  IssueStatusEnum,
} from '@src/common/feishu/card/warning-card/interface';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { NodeConfigService } from '@src/config/node-config.service';
import dayjs from 'dayjs';

@Injectable()
export class WikiAlertFeishuAdapter extends BaseAlertFeishuAdapter {
  protected event: BaseAlertEvent;
  constructor(
    protected readonly alertContext: AlertContext<BaseAlertEvent>,
    protected readonly tenantContext: TenantContext,
  ) {
    super();
  }
  async setEvent(event: BaseAlertEvent) {
    this.event = event;
  }

  async toAplusAlertCardData(): Promise<BaseWarningCardData> {
    await this.setEvent(this.alertContext.event as BaseAlertEvent);

    return {
      userId: NodeConfigService.getTenantConfigItem(
        this.tenantContext.tenant,
        'WikiBlackListCheckoutUserId',
      ) as string,
      title: this.event.level == 'fatal' ? '高危报警' : '异常报警',
      errorType: this.event.type,
      errorMessage: this.event.title,
      userName: '',
      linkUrl: this.event.feishuUrl,
      level: this.event.level,
      eventType: this.event.type,
      content: this.event.culprit,
      count: 1,
      status: IssueStatusEnum['unresolved'],
      issueId: this.event.issueId,
      errorTime: dayjs(this.event.timestamp * 1000).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
    };
  }
}
