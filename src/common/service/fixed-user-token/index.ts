import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import BaseSchedule from '@src/common/base/base.schedule';
import {
  TenantContext,
  TenantContextType,
} from '@src/common/service/context/tenant.context';
import { FeishuAuthType } from '@src/common/feishu/type/auth';

@Injectable()
export default class FixedTokenService extends BaseSchedule {
  protected readonly isOpen = ['test', 'prod', 'production'].includes(
    process.env.NODE_ENV,
  );
  //每30分钟运行一次
  protected readonly cron: string;
  protected readonly jobName: string;
  protected readonly projectModule: string;

  private readonly redis: Redis;
  constructor(
    protected redisService: RedisService,
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(tenantContext, schedulerRegistry);
    this.redis = redisService.getClient();
  }

  async handle(tenantInfo: TenantContextType) {
    if (process.env.NODE_ENV === 'test' && tenantInfo.user.supplierCode === 'C')
      return;
    this.loadToken(tenantInfo);
  }
  async loadToken(tenantInfo: TenantContextType) {
    const cacheKey = this.redisService.buildCacheKeyWithTemplates(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN_USED,
      {
        module: this.projectModule,
      },
    );
    const tokenInCached: FeishuAuthType = await this.redis.hgetall(cacheKey);
    if (!tokenInCached?.refresh_token) {
      this.sendAlertMsg(
        '服务商：' + tenantInfo.tenantCode,
        'token in cache is null：' + cacheKey,
        '刷新飞书Token异常',
      );
      return;
    }
    const authClient = ClientFactory.create(FeishuApp.AilyAplusClient);

    const res = await authClient.client.authen.refreshAccessToken.create({
      data: {
        grant_type: 'refresh_token',
        refresh_token: tokenInCached.refresh_token,
      },
    });
    if (res.code !== 0) {
      this.sendAlertMsg(
        '服务商：' + tenantInfo.tenantCode,
        res.msg,
        '刷新飞书Token异常',
      );
      return;
    }
    await this.redis.hset(cacheKey, res.data);
    this.redis.expire(cacheKey, 60 * 60 * 24);
  }
}
