import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import * as lark from '@larksuiteoapi/node-sdk';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import BaseSchedule from '@src/common/base/base.schedule';
import { TenantContext } from '@src/common/service/context/tenant.context';
// import { NodeConfigService } from '@src/config/node-config.service';

export type FeishuAuthType = Awaited<
  ReturnType<lark.Client['authen']['refreshAccessToken']['create']>
>['data'];

@Injectable()
export default class FixedTokenService extends BaseSchedule {
  //每30分钟运行一次
  protected readonly cron = '0 */30 * * * *';
  protected readonly jobName = 'Refresh Fixed Token';

  private client: lark.Client;
  private readonly redis: Redis;
  constructor(
    protected redisService: RedisService,
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(tenantContext, schedulerRegistry);
    this.redis = redisService.getClient();
  }

  async handle(force = false) {
    if (!force && ['development', 'dev'].includes(process.env.NODE_ENV)) return;
    const authClient = ClientFactory.create(FeishuApp.AilyAplusClient);
    this.client = authClient.client;
    this.loadToken();
  }
  async loadToken() {
    const cacheKey = this.redisService.buildCacheKey(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN_USED,
    );
    const tokenInCached: FeishuAuthType = await this.redis.hgetall(cacheKey);
    this.logger.log('[ cachedInfo ] >' + JSON.stringify(tokenInCached));

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
    await this.redis.hset(cacheKey, res.data);
    this.redis.expire(cacheKey, 60 * 60 * 24);
  }

  sendAlertMsg(errorMessage: string) {
    sendCommonCardToFeishu({
      title: '定时刷新Token异常报警',
      project: process.env.PROJECT_NAME,
      color: 'red',
      message: `刷新飞书Token异常`,
      content: errorMessage,
    });
  }
}
