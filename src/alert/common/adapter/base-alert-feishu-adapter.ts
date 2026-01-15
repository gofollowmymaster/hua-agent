import { AlertEvent } from '@src/alert/common/type/alert';
// import { CommonCardData } from '@src/common/feishu/card/alert-card';
import { AlertContext } from '../../../common/base/alert-event.context';
import { UnresolvedCardData } from '@src/common/feishu/card/warning-card/interface';

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
  abstract toAplusAlertCardData(): Promise<UnresolvedCardData>;
}
