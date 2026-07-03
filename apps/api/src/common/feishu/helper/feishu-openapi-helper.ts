import * as lark from '@larksuiteoapi/node-sdk';

import FeishuClient from '../clients/client';

import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';

import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuDataApiHelper from './feishu-data-api-helper';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { FeishuApp } from '../clients';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import FeishuAuthHelper from './feishu-auth-helper';
import { EphemeralSendParams, EphemeralSendReturn } from '../type/openapis';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuOpenapiHelper extends FeishuDataApiHelper {
  protected readonly useCache = true;
  protected readonly ttl = 60 * 30;
  protected readonly apiPrefix = 'https://open.feishu.cn/open-apis/';
  constructor(
    @Inject(FEISHU_CLIENT_ID) protected readonly feishuClient: FeishuClient,
    protected readonly userContext: TenantContext,
    protected redisService: RedisService,
    protected feishuAuthHelper: FeishuAuthHelper,
    protected httpService: HttpService,
  ) {
    super(redisService);
  }

  private async request(
    url: string,
    data: Record<string, any>,
    appName?: FeishuApp,
  ) {
    const {
      app_access_token: appAccessToken,
      tenant_access_token: tenantAccessToken,
    } = await this.feishuAuthHelper.getAppAccessToken(appName);

    const response = await firstValueFrom(
      this.httpService.post(this.apiPrefix + url, data, {
        headers: { Authorization: `Bearer ${tenantAccessToken}` },
      }),
    );
    return response.data;
  }

  public async updateByCard(message_id: string, data, appName?: FeishuApp) {
    return this.requestWrapper(() => {
      return this.request('im/v1/messages/' + message_id, data, appName);
    }, 'updateByCard');
  }

  public async getTicket(appName?: FeishuApp) {
    const { app_access_token: appAccessToken } =
      await this.feishuAuthHelper.getAppAccessToken(appName);
    const data = this.readWrapper(
      async () => {
        return this.request('jssdk/ticket/get', {}, appName);
      },
      true,
      appAccessToken + ':getTicket',
    );

    return data;
  }

  async createEphemeralInteractToGroup(
    data: EphemeralSendParams,
    appName?: FeishuApp,
  ): Promise<EphemeralSendReturn> {
    console.log('[ data ] >', data);
    return this.requestWrapper(() => {
      return this.request('ephemeral/v1/send', data, appName);
    }, 'ephemeralSend');
  }
}

export default FeishuOpenapiHelper;
