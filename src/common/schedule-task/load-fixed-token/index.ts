import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import dayjs from 'dayjs';
import * as lark from '@larksuiteoapi/node-sdk';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { FeishuApiException } from '@src/common/exception/feishu-api-exception';
import { CronException } from '@src/common/exception/cron-exception';

export type FeishuAuthType = Awaited<
  ReturnType<lark.Client['authen']['refreshAccessToken']['create']>
>['data'];

@Injectable()
export default class FixedTokenService {
  private readonly client: lark.Client;
  private readonly logger = new Logger(FixedTokenService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) protected cache: Cache,
  ) {
    const authClient = ClientFactory.create(FeishuApp.AilyAplusClient);
    this.client = authClient.client;
  }

  //每30分钟运行一次
  @Cron('0 */5 * * * *')
  async handleCron() {
    this.logger.debug(
      'FixedTokenService Called when the current is' +
        dayjs().format('YYYY-MM-DD HH:mm:ss'),
    );
    this.loadToken();
  }
  async loadToken() {
    const tokenInCached: FeishuAuthType = await this.cache.get(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN,
    );
    console.log('[ cachedinfo ] >', tokenInCached);
    if (!tokenInCached) {
      throw new CronException('token is null');
    }

    const res = await this.client.authen.refreshAccessToken.create({
      data: {
        grant_type: 'refresh_token',
        refresh_token: tokenInCached.refresh_token,
      },
    });
    if (res.code !== 0) {
      throw new FeishuApiException(res.msg);
    }

    console.log('[ refreshAccessToken ] >', res);

    await this.cache.set(RedisKeys.FEISHU_FIXED_ACCESS_TOKEN, res.data);
  }
}
