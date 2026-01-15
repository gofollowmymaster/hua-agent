import { PrismaService } from '@src/common/service/prisma/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RedisService } from '@src/common/service/redis/redis.service';
import { ErrorBaseService } from '@src/common/base/error-base.service';
import { Injectable } from '@nestjs/common';
import { MsgAlertService } from '@src/common/base/msg-alert.service';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import FeishuUserHelper from '@src/common/feishu/helper/feishu-user-helper';
import { HttpService } from '@nestjs/axios';
import { AlertContext } from '@src/common/base/alert-event.context';

@Injectable()
export class ErrorService extends ErrorBaseService {
  constructor(
    protected prisma: PrismaService,
    protected readonly logger: LoggerService,
    protected readonly redisService: RedisService,
    protected readonly msgAlertService: MsgAlertService,
    protected readonly alertContext: AlertContext,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly feishuUserHelper: FeishuUserHelper,
    protected readonly httpService: HttpService,
  ) {
    super(redisService);
  }

  async errorHookHandler(errorEvent) {
    this.alertContext.run({ errorEvent }, async () => {
      return this.errorHandler();
    });
  }

  protected async writeToTable() {
    return {};
  }

  async updateTable() {}

  protected async afterCreateIssueCard() {
    const errorEvent = this.alertContext.event;
    //部分消息不需要AI辅助分析 比如：403
    if (
      errorEvent.environment.indexOf('prod') < 0 ||
      [
        'request.onerror Network Error',
        'Object captured as exception with keys: code, message, method, payload, resData',
      ].includes(errorEvent.message) ||
      process.env.NODE_ENV !== 'production'
    )
      return;
  }
}
