import { Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly config: ConfigService,
  ) {}

  get tenantId(): string {
    return this.request['tenantId'];
  }

  get tenantConfig(): Record<string, any> {
    // 返回租户特定配置
    // console.log(
    //   '[ this.config.get(tenantConfig) ] >',
    //   this.config.get('tenantConfig'),
    // );
    // console.log(
    //   '[ this.request[supplierCode] ] >',
    //   this.request['supplierCode'],
    // );
    const tenantConfig =
      this.config.get('tenantConfig')?.[
        this.request['supplierCode'] || 'aplus'
      ];
    return tenantConfig || {};
  }
}
