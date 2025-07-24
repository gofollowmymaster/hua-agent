import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { FeishuAuthType } from '@src/common/schedule-task/load-fixed-token';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { FeishuApiException } from '@src/common/exception/feishu-api-exception';

@Injectable()
export class AilyService {
  constructor(@Inject(CACHE_MANAGER) protected cache: Cache) {}

  async getToken(): Promise<FeishuAuthType> {
    const cachedinfo: FeishuAuthType = await this.cache.get(
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

    this.cache.set(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN,
      res.data,
      1000 * 60 * 60 * 24,
    );
    return res.data;
  }
}
