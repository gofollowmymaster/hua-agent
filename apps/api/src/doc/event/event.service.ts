import { Injectable } from '@nestjs/common';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { PrismaService } from '@src/common/service/prisma/prisma.service';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { EventHandlerParameters } from '@src/common/feishu/type/feishu-event';

@Injectable()
export class FeishuEventService {
  protected readonly redis: Redis;
  constructor(
    private readonly logger: LoggerService,
    readonly prisma: PrismaService,
    readonly messageHelper: FeishuMessageHelper,
    readonly redisService: RedisService,
  ) {
    this.redis = redisService.getClient();
  }

  async edit(event: EventHandlerParameters<'drive.file.edit_v1'>) {
    const { file_type, file_token } = event;
    console.log('[ file_token ] >', file_type, file_token);
    return 'ok';
  }
}
