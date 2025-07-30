import { Module } from '@nestjs/common';
import { AlertMsgController } from './alert-message/alert-message.controller';
import { AlertMsgService } from './alert-message/alert-message.service';
import { PrismaService } from '@src/prisma.service';
import { FeishuHelperModule } from '@src/common/feishu/hepler/helper.module';

// import { FeishuTableModule } from '@src/common/feishu/table/table.module';
import SentryApiAlertAdapter from './alert-message/adapter/sentry-alert-adapter';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuApiAlertTable from './table/api-alert-table';
import FeishuFrontendAlertTable from './table/frontend-alert-table';
import FeishuFrontendAlertIssueTable from './table/frontend-alert-issue-table';
import FeishuBusinessLineTable from '../common/table/business-line-table';

import { FeishuEventController } from './event/event.controller';
import { FeishuEventService } from './event/event.service';

import { SentryWebhookController } from './sentry-integrations/webhook.controller';
import { SentryWebhookService } from './sentry-integrations/webhook.service';
import FeishuApiAlertIssueTable from './table/api-alert-issue-table';
import SentryAlertAdapter from './alert-message/adapter/sentry-alert-adapter';

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
    FeishuApiAlertIssueTable,
    FeishuFrontendAlertTable,
    FeishuFrontendAlertIssueTable,
    FeishuBusinessLineTable,
    AlertMsgService,
    PrismaService,
    SentryApiAlertAdapter,
    FeishuEventService,
    SentryWebhookService,
    SentryAlertAdapter,
  ],
  exports: [AlertMsgService, FeishuEventService, SentryWebhookService],
})
export class AlertModule {}
