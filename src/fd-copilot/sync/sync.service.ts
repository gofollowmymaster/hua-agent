import { HttpException, Injectable } from '@nestjs/common';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { FeishuPushDto } from './dto/sync';
import { createHash } from 'crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SyncService {
  protected readonly redis: Redis;
  constructor(
    protected redisService: RedisService,
    @InjectQueue('sync-document') private syncDocumentQueue: Queue,
  ) {
    this.redis = redisService.getClient();
  }

  async pushDocument(params: FeishuPushDto): Promise<any> {
    const key = RedisKeys.PUSH_FEISHU_DOC_CACHE.replace(
      '{tag}',
      params.module + ':' + params.tag,
    );

    const { hash } = await this.redis.hgetall(key);

    const contentHash = createHash('md5').update(params.content).digest('hex');
    if (contentHash == hash) {
      throw new HttpException('文档内容未改变', 200);
    }
    const res = await this.syncDocumentQueue.add('syncDocument', params);
    return { msg: 'ok', data: res.id };
  }
}
