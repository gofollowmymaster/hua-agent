import { PrismaService } from '@src/common/service/prisma/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RedisService } from '@src/common/service/redis/redis.service';
import { ErrorBaseService } from '@src/common/base/error-base.service';
import { Injectable } from '@nestjs/common';
import { AlertContext } from '@src/common/base/alert-event.context';
import { WikiMsgSenderService } from './check-msg-sender';
import { BaseAlertEvent } from '@src/common/base/interface';
import { WikiAlertFeishuAdapter } from './alert-feishu.adapter';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import { HttpService } from '@nestjs/axios';
import FeishuUserHelper from '@src/common/feishu/helper/feishu-user-helper';

@Injectable()
export class WarningMsgService extends ErrorBaseService {
  protected readonly CardType = 'common';

  constructor(
    protected prisma: PrismaService,
    protected readonly logger: LoggerService,
    protected readonly alertFeishuAdapter: WikiAlertFeishuAdapter,
    protected readonly redisService: RedisService,
    protected readonly msgAlertService: WikiMsgSenderService,
    protected readonly alertContext: AlertContext<BaseAlertEvent>,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly httpService: HttpService,
    protected readonly feishuUserHelper: FeishuUserHelper,
  ) {
    super(redisService);
  }

  async errorHookHandler(errorEvent: BaseAlertEvent) {
    this.alertContext.run({ errorEvent }, async () => {
      return this.errorHandler();
    });
  }

  protected async writeToTable() {
    return {};
  }

  async updateTable() {}

  protected async afterCreateIssueCard() {}
}
