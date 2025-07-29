import { Module } from '@nestjs/common';
import { AlertMsgController } from './alert-message/alert-message.controller';
import { AlertMsgService } from './alert-message/alert-message.service';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { FeishuHelperModule } from '@src/common/feishu/hepler/helper.module';

// import { FeishuTableModule } from '@src/common/feishu/table/table.module';
import SentryApiAlertAdapter from './alert-message/adapter/sentry-alert-adapter';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuApiAlertTable from './alert-message/table/api-alert-table';
import FeishuFrontendAlertTable from './alert-message/table/frontend-alert-table';
import FeishuBusinessLineTable from '../common/table/business-line-table';

import { FeishuEventController } from './event/event.controller';
import { FeishuEventService } from './event/event.service';

import { SentryWebhookController } from './sentry-integrations/webhook.controller';
import { SentryWebhookService } from './sentry-integrations/webhook.service';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AlertClient)),
    // FeishuTableModule,
  ],
  controllers: [
    AlertMsgController,
    FeishuEventController,
    SentryWebhookController,
  ],
  providers: [
    FeishuApiAlertTable,
    FeishuFrontendAlertTable,
    FeishuBusinessLineTable,
    AlertMsgService,
    PrismaService,
    LoggerService,
    SentryApiAlertAdapter,
    FeishuEventService,
    SentryWebhookService,
  ],
  exports: [AlertMsgService, FeishuEventService, SentryWebhookService],
})
export class AlertModule {}
