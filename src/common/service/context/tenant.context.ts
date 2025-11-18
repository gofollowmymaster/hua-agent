import { Injectable } from '@nestjs/common';
import { TenantCode, tenantCodeMap } from '@src/config/tenant';
import { UserContext } from '@src/type/global';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  user: UserContext;
  // requestId: string;
  // timestamp: number;
}

@Injectable()
export class TenantContext {
  private readonly asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  run(context: RequestContext, callback: () => void) {
    this.asyncLocalStorage.run(context, callback);
  }

  getStore(): RequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  get user() {
    return this.getStore()?.user;
  }

  get userId(): number | undefined {
    return this.user?.userId;
  }
  get tenant(): TenantCode | undefined {
    return tenantCodeMap[this.user?.supplierCode];
  }
}
