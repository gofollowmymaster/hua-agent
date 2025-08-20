import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import * as lark from '@larksuiteoapi/node-sdk';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';

export type FeishuAuthType = Awaited<
  ReturnType<lark.Client['authen']['refreshAccessToken']['create']>
>['data'];

@Injectable()
export default class FixedTokenService {
  private readonly client: lark.Client;
  private readonly logger = new Logger(FixedTokenService.name);
  private readonly messagerHelper: FeishuMessageHelper;
  private readonly redis: Redis;
  constructor(
    private readonly config: ConfigService,
    protected redisService: RedisService,
  ) {
    const authClient = ClientFactory.create(FeishuApp.AilyAplusClient);
    this.client = authClient.client;
    this.messagerHelper = new FeishuMessageHelper(
      ClientFactory.create(FeishuApp.AlertClient, config),
    );
    this.redis = redisService.getClient();
  }

  //每30分钟运行一次
  @Cron('0 */30 * * * *')
  async handleCron(force = false) {
    this.logger.debug('FixedTokenService Called ');
    if (!force && ['development', 'dev'].includes(process.env.NODE_ENV)) return;

    this.loadToken();
  }
  async loadToken() {
    const tokenInCached: FeishuAuthType = await this.redis.hgetall(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN_USED,
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

    await this.redis.hset(RedisKeys.FEISHU_FIXED_ACCESS_TOKEN_USED, res.data);

    this.redis.expire(RedisKeys.FEISHU_FIXED_ACCESS_TOKEN_USED, 60 * 60 * 24);
  }

  sendAlertMsg(errorMessage: string) {
    sendCommonCardToFeishu({
      title: '定时刷新Token异常报警',
      project: 'aplus-sql-server',
      color: 'red',
      message: `刷新飞书Token异常`,
      content: errorMessage,
    });
  }
}
