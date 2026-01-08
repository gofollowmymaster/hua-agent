import { Injectable } from '@nestjs/common';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { PrismaService } from '@src/common/service/prisma/prisma.service';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import FeishuApiAlertIssueTable from '../common/table/api-alert-issue-table';
import FeishuFrontendAlertIssueTable from '../common/table/frontend-alert-issue-table';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import {
  EventHandlerParameters,
  ReceiveEventParams,
} from '../../common/feishu/type/feishu-event';
import { FeishuReceiveCallback } from './handler/receive-handler';

@Injectable()
export class FeishuEventService {
  protected readonly redis: Redis;
  constructor(
    private readonly logger: LoggerService,
    readonly prisma: PrismaService,
    readonly messageHelper: FeishuMessageHelper,
    readonly redisService: RedisService,
    protected readonly feishuApiAlertIssueTable: FeishuApiAlertIssueTable,
    protected readonly feishuFrontendAlertIssueTable: FeishuFrontendAlertIssueTable,
    protected readonly feishuReceiveCallback: FeishuReceiveCallback,
  ) {
    this.redis = redisService.getClient();
  }

  async receive(event: ReceiveEventParams) {
    return await this.feishuReceiveCallback.handle(event);
  }
  async read(event: EventHandlerParameters<'im.message.message_read_v1'>) {
    const { reader, message_id_list } = event;

    const messageId = message_id_list[0];
    await this.prisma.alertMessageUser.updateMany({
      where: {
        messageId,
        fUserId: reader.reader_id.user_id,
      },
      data: {
        readTime: new Date(),
      },
    });
    return 'ok';
  }
  async reaction(
    event: EventHandlerParameters<'im.message.reaction.created_v1'>,
  ) {
    const { message_id: messageId, reaction_type, user_id } = event;
    console.log('reaction_type:', reaction_type);

    this.prisma.alertMessageUser.updateMany({
      where: {
        messageId,
        fUserId: user_id.user_id,
      },
      data: {
        reactionTime: new Date(),
      },
    });
    return 'ok';
  }
}
