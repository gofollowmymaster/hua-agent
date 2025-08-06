import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma.service';

import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';

import AlertFeishuAdapter from '../common/adapter/alert-feishu-adapter';
import FeishuApiAlertTable from '../common/table/api-alert-table';
import FeishuFrontendAlertTable from '../common/table/frontend-alert-table';
import FeishuBusinessLineTable from '../../common/table/business-line-table';
import FeishuFrontendAlertIssueTable from '../common/table/frontend-alert-issue-table';
import FeishuApiAlertIssueTable from '../common/table/api-alert-issue-table';
import { RedisService } from '@src/common/service/redis/redis.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { AlertBaseService } from '../common/service/alert-base.service';
import { AlertEvent } from '../common/type/alert';
import CommonAlertCard from '@src/common/feishu/card/alert-card';

@Injectable()
export class AlertMsgService extends AlertBaseService {
  // private messageHelper;

  protected ignoreCodeList = ['401', '10002'];
  constructor(
    protected prisma: PrismaService,
    protected readonly logger: LoggerService,
    protected readonly config: ConfigService,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly feishuApiTable: FeishuApiAlertTable,
    protected readonly feishuApiIssueTable: FeishuApiAlertIssueTable,
    protected readonly feishuFrontendTable: FeishuFrontendAlertTable,
    protected readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable,
    protected readonly feishuBusinessLineTable: FeishuBusinessLineTable,
    protected readonly redisService: RedisService,
    protected readonly alertFeishuAdapter: AlertFeishuAdapter,
  ) {
    super(redisService);
  }

  /**
   * sentry webhook处理
   * @param alertInfo
   */
  async sentryAlertHook(errorEvent: AlertEvent) {
    await this.alertFeishuAdapter.setEvent(errorEvent);
    this.writeToTable(errorEvent);
    if (this.ignoreCodeList.includes(errorEvent.requestData?.code + '')) {
      return;
    }
    const cardData = this.alertFeishuAdapter.toCommonCardeData();
    const content = CommonAlertCard.buildCardMsg(cardData);

    // 异步发送飞书消息
    this.sendFsAlertMsg(errorEvent, content);
  }
}
