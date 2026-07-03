// import { CommonCardData } from '@src/common/feishu/card/alert-card';
import { AlertContext } from '@src/common/base/alert-event.context';
import { BaseWarningCardData } from '@src/common/feishu/card/warning-card/interface';
import { BaseAlertEvent } from '@src/common/base/interface';

export default abstract class BaseAlertFeishuAdapter {
  protected event: BaseAlertEvent;
  protected readonly alertContext: AlertContext<BaseAlertEvent>;

  abstract setEvent(event: BaseAlertEvent);

  abstract toAplusAlertCardData(): Promise<BaseWarningCardData>;
  truncateStr(data: any) {
    const RawData = JSON.stringify(data);
    return RawData.length > 300000 ? RawData.slice(0, 300000) + '...' : RawData;
  }
  truncateRawData() {
    return this.truncateStr(this.event.rawData);
  }
}
