import { Injectable } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AliDevopsDto } from './dto/ali';

@Injectable()
export class AliService {
  protected readonly redis: Redis;
  constructor(
    protected redisService: RedisService,
    @InjectQueue('sync-document') private syncDocumentQueue: Queue,
  ) {
    this.redis = redisService.getClient();
  }

  async publish(params: AliDevopsDto): Promise<any> {
    return;
  }
}
