import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { AlertEvent } from '../type/alert';

export interface AlertContextStore {
  errorEvent: AlertEvent;
}

@Injectable()
export class AlertContext {
  private readonly asyncLocalStorage =
    new AsyncLocalStorage<AlertContextStore>();

  run(context: AlertContextStore, callback: () => any) {
    return this.asyncLocalStorage.run(context, callback);
  }

  getStore(): AlertContextStore | undefined {
    return this.asyncLocalStorage.getStore();
  }
  get event() {
    return this.getStore().errorEvent;
  }
}
