import { Injectable } from '@nestjs/common';
import { TenantCode } from '@src/config/tenant';
import { UserContext } from '@src/type/global';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextType {
  user?: UserContext;
  tenantCode: TenantCode;
  spaceIds?: string[];
  // timestamp: number;
}

@Injectable()
export class TenantContext {
  private readonly asyncLocalStorage =
    new AsyncLocalStorage<TenantContextType>();

  run(context: TenantContextType, callback: () => void) {
    this.asyncLocalStorage.run(context, callback);
  }

  getStore(): TenantContextType | undefined {
    return this.asyncLocalStorage.getStore();
  }

  get user() {
    return this.getStore()?.user;
  }

  get userId(): number | undefined {
    return this.user?.userId;
  }
  get tenant(): TenantCode | undefined {
    return this.getStore()?.tenantCode;
  }
}
