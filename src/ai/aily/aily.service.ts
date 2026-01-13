import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { FeishuApiException } from '@src/common/exception/feishu-api-exception';
import { BindSessionCodeDto } from './dto/aily';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { FeishuAuthType } from '@src/common/feishu/type/auth';

@Injectable()
export class AilyService {
  protected readonly redis: Redis;
  constructor(protected redisService: RedisService) {
    this.redis = redisService.getClient();
  }

  async getToken(): Promise<FeishuAuthType> {
    const cacheKey = this.redisService.buildCacheKey(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN_USED,
    );
    const cachedInfo: FeishuAuthType = await this.redis.hgetall(cacheKey);
    return cachedInfo;
  }
  async getTokenByCode(code: string): Promise<FeishuAuthType> {
    const client = ClientFactory.create(FeishuApp.AilyAplusClient);
    const res = await client.client.authen.accessToken.create({
      data: {
        grant_type: 'authorization_code',
        code: code,
      },
    });

    if (res.code !== 0) {
      throw new FeishuApiException(res.msg);
    }
    const key = this.redisService.buildCacheKeyWithTemplates(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN,
      {
        module: 'aily',
        code: code,
      },
    );
    await this.redis.hset(key, res.data);
    this.redis.expire(key, 60 * 60 * 24);
    return res.data;
  }
  async useTokenByCode(code: string) {
    const codeKey = this.redisService.buildCacheKeyWithTemplates(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN,
      {
        module: 'aily',
        code: code,
      },
    );

    const userInfo = await this.redis.hgetall(codeKey);
    const usedKey = this.redisService.buildCacheKeyWithTemplates(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN_USED,
      {
        module: 'aily',
      },
    );
    await this.redis.hset(usedKey, userInfo);
    return true;
  }

  async bindSession(params: BindSessionCodeDto) {
    const key = this.redisService.buildCacheKey(
      RedisKeys.FEISHU_AILY_SESSION_CODE,
      '{code}',
      params.code,
    );
    await this.redis.setex(key, 60 * 60 * 24, params.sessionId);
    return;
  }
  async verifySession(params: BindSessionCodeDto) {
    const key = this.redisService.buildCacheKey(
      RedisKeys.FEISHU_AILY_SESSION_CODE,
      '{code}',
      params.code,
    );
    const sessionId = await this.redis.get(key);

    if (sessionId !== params.sessionId) {
      throw new UnauthorizedException('非法的Aily会话');
    }
    return await this.getToken();
  }
}
