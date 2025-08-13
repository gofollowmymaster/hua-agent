import { Injectable } from '@nestjs/common';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { FeishuApiException } from '@src/common/exception/feishu-api-exception';
import { BindSessionCodeDto } from './dto/aily';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { FeishuAuthType } from '../common/schedule/load-fixed-token';

@Injectable()
export class AilyService {
  protected readonly redis: Redis;
  constructor(protected redisService: RedisService) {
    this.redis = redisService.getClient();
  }

  async getToken(): Promise<FeishuAuthType> {
    const cachedinfo: FeishuAuthType = await this.redis.hgetall(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN,
    );

    return cachedinfo;
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

    await this.redis.hset(RedisKeys.FEISHU_FIXED_ACCESS_TOKEN, res.data);
    this.redis.expire(RedisKeys.FEISHU_FIXED_ACCESS_TOKEN, 60 * 60 * 24);
    return res.data;
  }

  async bindSession(params: BindSessionCodeDto) {
    await this.redis.hset(
      RedisKeys.FEISHU_AILY_SESSION_CODE,
      params.sessionId,
      params.code,
    );
    this.redis.expire(RedisKeys.FEISHU_AILY_SESSION_CODE, 60 * 60 * 24);

    return;
  }
  async verifySession(params: BindSessionCodeDto) {
    const code = await this.redis.hget(
      RedisKeys.FEISHU_AILY_SESSION_CODE,
      params.sessionId,
    );

    return code == params.code;
  }
}
