import { Injectable, Scope } from '@nestjs/common';
import { AlertEvent } from '@src/alert/common/type/alert';
import { CommonCardData } from '@src/common/feishu/card/alert-card';

@Injectable({ scope: Scope.REQUEST })
export default class AlertFeishuAdapter {
  private event: AlertEvent;
  constructor() {}
  async setEvent(event: AlertEvent) {
    this.event = event;
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
}
