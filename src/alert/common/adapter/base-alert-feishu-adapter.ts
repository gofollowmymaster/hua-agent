import { Injectable } from '@nestjs/common';
import { AlertEvent } from '@src/alert/common/type/alert';
import { CommonCardData } from '@src/common/feishu/card/alert-card';
import { UnresolvedCardData } from '@src/common/feishu/card/error-unresolve-card';

@Injectable()
export default abstract class BaseAlertFeishuAdapter {
  protected event: AlertEvent;

  abstract setEvent(event: AlertEvent);

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
  abstract toAplusAlertCardeData(): UnresolvedCardData;
}
