import { Injectable } from '@nestjs/common';

import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { SensitiveWordDto } from './dto/sensitive-word.dto';
import { WikiService } from '@src/doc/wiki/wiki.service';
import { BlackListType, WikiBlackListDto } from '@src/doc/wiki/dto/wiki.dto';

@Injectable()
export class SensitiveWordService {
  private readonly redis: Redis;
  private presetPlatform = {
    version: '1.0.0',
    platforms: [
      {
        id: 'boat',
        name: '云舟',
        words: [] as string[],
        domains: ['*.test-com.elnkpro.com', '*.clouboat.com'],
      },
      {
        id: 'yurex',
        name: 'yurex',
        words: [] as string[],
        domains: ['*.yurexcc.com'],
      },
      {
        id: '袋鼠云',
        name: '袋鼠云',
        words: [] as string[],
        domains: [
          'dev-v2.elnkpro.com',
          '*.test-xw.elnkpro.com',
          '*.uat.elnkpro.com',
          '*.aplnk.com',
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
        supplierCode: platform.id,
        status: true,
      } as WikiBlackListDto);
      const blackList = (res as any).list || [];
      const words = blackList.map((item) => item.关键字);

      platform.words = words;
    }

    return this.presetPlatform;
  }
}
