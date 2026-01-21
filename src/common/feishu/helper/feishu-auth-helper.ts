import * as lark from '@larksuiteoapi/node-sdk';

import FeishuClient from '../clients/client';

import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';

import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuDataApiHelper from './feishu-data-api-helper';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { ClientFactory, FeishuApp } from '../clients';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuAuthHelper extends FeishuDataApiHelper {
  protected readonly useCache = true;
  protected readonly ttl = 60 * 30;
  constructor(
    @Inject(FEISHU_CLIENT_ID) protected readonly feishuClient: FeishuClient,
    protected readonly userContext: TenantContext,
    protected redisService: RedisService,
  ) {
    super(redisService);
  }
  async getAppAccessToken(appName?: FeishuApp, useCache = true): Promise<any> {
    let client: lark.Client = this.client;
    if (appName) {
      client = ClientFactory.create(appName)?.client;
    }
    const res = await this.readWrapper(
      async () => {
        const res = await client.auth.v3.appAccessToken.internal(
          {
            data: {
              app_id: client.appId,
              app_secret: client.appSecret,
            },
          },
          lark.withTenantToken(''),
        );

        return {
          code: res.code,
          data: res,
        };
      },
      useCache,
      'getAppAccessToken:' + client.appId,
    );
    return res;
  }
}

export default FeishuAuthHelper;
