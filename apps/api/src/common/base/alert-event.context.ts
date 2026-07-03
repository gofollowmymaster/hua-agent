import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface AlertContextStore<T> {
  errorEvent: T;
}

@Injectable()
export class AlertContext<T> {
  private readonly asyncLocalStorage = new AsyncLocalStorage<
    AlertContextStore<T>
  >();

  run(context: AlertContextStore<T>, callback: () => any) {
    return this.asyncLocalStorage.run(context, callback);
  }

  getStore(): AlertContextStore<T> | undefined {
    return this.asyncLocalStorage.getStore();
  }
  get event() {
    return this.getStore().errorEvent;
  }
}
