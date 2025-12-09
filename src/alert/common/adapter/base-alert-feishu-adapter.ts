import { AlertEvent } from '@src/alert/common/type/alert';
// import { CommonCardData } from '@src/common/feishu/card/alert-card';
import { UnresolvedCardData } from '@src/common/feishu/card/error-unresolve-card';
import { AlertContext } from '../service/alert-event.context';

export default abstract class BaseAlertFeishuAdapter {
  protected event: AlertEvent;
  protected readonly alertContext: AlertContext;

  abstract setEvent(event: AlertEvent);

  // toCommonCardeData(): CommonCardData {
  //   return {
  //     environment: this.event.environment,
  //     project: this.event.pageModuleName,
  //     linkUrl: this.event.webUrl,
  //     level: this.event.level,
  //     message: this.event.type,
  //     content: this.event.culprit,
  //     timestamp: this.event.timestamp,
  //   };
  // }
  abstract toAplusAlertCardeData(): Promise<UnresolvedCardData>;
}
