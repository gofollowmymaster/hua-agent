import { Injectable } from '@nestjs/common';

import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { SensitiveWordDto } from './dto/sensitive-word.dto';

@Injectable()
export class SensitiveWordService {
  private readonly redis: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = redisService.getClient();
  }

  async alert(params: SensitiveWordDto) {
    return params.sensitiveWord;
  }
}
