import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import * as lark from '@larksuiteoapi/node-sdk';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { sendCommonCardToFeishu } from '@src/common/feishu/utils';

export type FeishuAuthType = Awaited<
  ReturnType<lark.Client['authen']['refreshAccessToken']['create']>
>['data'];

@Injectable()
export default class FixedTokenService {
  private readonly client: lark.Client;
  private readonly logger = new Logger(FixedTokenService.name);
  private readonly messagerHelper: FeishuMessageHelper;
  constructor(
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) protected cache: Cache,
  ) {
    const authClient = ClientFactory.create(FeishuApp.AilyAplusClient);
    this.client = authClient.client;
    this.messagerHelper = new FeishuMessageHelper(
      ClientFactory.create(FeishuApp.AlertClient, config),
    );
  }

  //每30分钟运行一次
  @Cron('0 */30 * * * *')
  async handleCron() {
    this.logger.debug('FixedTokenService Called ');
    this.loadToken();
  }
  async loadToken() {
    const tokenInCached: FeishuAuthType = await this.cache.get(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN,
    );
    this.logger.log('[ cachedinfo ] >' + JSON.stringify(tokenInCached));

    if (!tokenInCached?.refresh_token) {
      this.sendAlertMsg('token in cache is null');
      return;
    }

    const res = await this.client.authen.refreshAccessToken.create({
      data: {
        grant_type: 'refresh_token',
        refresh_token: tokenInCached.refresh_token,
      },
    });

    this.logger.log('[ refreshAccessToken ] >' + JSON.stringify(res));

    if (res.code !== 0) {
      this.sendAlertMsg(res.msg);
      return;
    }

    await this.cache.set(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN,
      res.data,
      1000 * 60 * 60 * 24,
    );
  }

  sendAlertMsg(errorMessage: string) {
    sendCommonCardToFeishu({
      title: '定时刷新Token异常报警',
      project: 'aplus-sql-server',
      color: 'red',
      errorType: `刷新飞书Token异常`,
      content: errorMessage,
    });
  }
}
