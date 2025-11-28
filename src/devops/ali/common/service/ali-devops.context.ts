import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface AliDevopsContextStore {
  token?: string;
}

@Injectable()
export class AliDevopsContext {
  private readonly asyncLocalStorage =
    new AsyncLocalStorage<AliDevopsContextStore>();

  run(context: AliDevopsContextStore, callback: () => void) {
    this.asyncLocalStorage.run(context, callback);
  }

  getStore(): AliDevopsContextStore | undefined {
    return this.asyncLocalStorage.getStore();
  }

  get token() {
    return this.getStore()?.token;
  }
}
