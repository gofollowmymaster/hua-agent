import { Injectable } from '@nestjs/common';

import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { SensitiveWordDto } from './dto/sensitive-word.dto';
import { WikiService } from '@src/doc/wiki/wiki.service';
import { BlackListType, EndpointNum } from '@src/doc/wiki/dto/wiki.dto';
import { tenantCodeMap } from '@src/config/tenant';

type PlatformType = {
  version: string;
  platforms: {
    id: string;
    supplierCode: string;
    name: string;
    words: string[];
    endpoint: EndpointNum[];
    domains: string[];
  }[];
};
@Injectable()
export class SensitiveWordService {
  private readonly redis: Redis;
  private presetPlatform: PlatformType = {
    version: '1.0.0',
    platforms: [
      {
        id: 'boat',
        supplierCode: 'boat',
        name: '云舟',
        words: [] as string[],
        endpoint: [EndpointNum.User],
        domains: [
          'auth.test-com.elnkpro.com',
          'user.test-com.elnkpro.com',
          'user.*.clouboat.com',
        ],
      },
      {
        id: 'boat-admin',
        name: '云舟-admin',
        supplierCode: 'boat',
        endpoint: [EndpointNum.Admin],
        words: [] as string[],
        domains: ['admin.test-com.elnkpro.com', 'admin.*.clouboat.com'],
      },
      {
        id: 'yurex',
        name: 'yurex',
        supplierCode: 'yurex',
        endpoint: [EndpointNum.User],
        words: [] as string[],
        domains: ['user.*.yurexcc.com', 'auth.*.yurexcc.com'],
      },
      {
        id: 'yurex-admin',
        name: 'yurex-admin',
        supplierCode: 'yurex',
        endpoint: [EndpointNum.Admin],
        words: [] as string[],
        domains: ['admin.*.yurexcc.com'],
      },
      {
        id: '袋鼠云',
        name: '袋鼠云',
        supplierCode: '袋鼠云',
        endpoint: [EndpointNum.User],
        words: [] as string[],
        domains: [
          'user.dev-v2.elnkpro.com',
          'user.test-xw.elnkpro.com',
          'user.uat.elnkpro.com',
          'user.aplnk.com',
          'localhost',
        ],
      },
      {
        id: '袋鼠云-admin',
        name: '袋鼠云-admin',
        supplierCode: '袋鼠云',
        endpoint: [EndpointNum.Admin],
        words: [] as string[],
        domains: [
          'admin.dev-v2.elnkpro.com',
          'admin.test-xw.elnkpro.com',
          'admin.uat.elnkpro.com',
          'admin.aplnk.com',
          'localhost',
        ],
      },
    ],
  };

  constructor(
    private readonly redisService: RedisService,
    private readonly wikiService: WikiService,
  ) {
    this.redis = redisService.getClient();
  }

  async alert(params: SensitiveWordDto) {
    return params.sensitiveWord;
  }
  async preset() {
    for (const platform of this.presetPlatform.platforms) {
      const res = await this.wikiService.blacklist({
        type: [BlackListType.text],
        supplierCode: platform.supplierCode as tenantCodeMap,
        status: true,
        endpoint: platform.endpoint,
      });
      const blackList = (res as any).list || [];
      const words = blackList.map((item) => item.关键字);

      platform.words = words;
    }

    return this.presetPlatform;
  }
}
