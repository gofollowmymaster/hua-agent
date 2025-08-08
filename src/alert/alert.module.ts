import { Module } from '@nestjs/common';
import { AlertMsgController } from './alert-message/alert-message.controller';
import { AlertMsgService } from './alert-message/alert-message.service';
import { PrismaService } from '@src/prisma.service';
import { FeishuHelperModule } from '@src/common/feishu/hepler/helper.module';

// import { FeishuTableModule } from '@src/common/feishu/table/table.module';
import SentryApiAlertAdapter from './common/adapter/alert-feishu-adapter';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuApiAlertTable from './common/table/api-alert-table';
import FeishuFrontendAlertTable from './common/table/frontend-alert-table';
import FeishuFrontendAlertIssueTable from './common/table/frontend-alert-issue-table';
import FeishuBusinessLineTable from '../common/table/business-line-table';

import { FeishuEventController } from './event/event.controller';
import { FeishuCallbackController } from './feishu-callback/callback.controller';
import { FeishuEventService } from './event/event.service';
import { FeishuCallbackService } from './feishu-callback/callback.service';

import { SentryWebhookController } from './sentry-integrations/webhook.controller';
import { SentryWebhookService } from './sentry-integrations/webhook.service';
import FeishuApiAlertIssueTable from './common/table/api-alert-issue-table';
import AlertFeishuAdapter from './common/adapter/alert-feishu-adapter';
import { SentryApiService } from './common/service/sentry-api-service';
import { HttpModule } from '@nestjs/axios';
import { PageErrorService } from './common/service/page-error-service';
import { RequestErrorService } from './common/service/request-error-service';
import PageAlertFeishuAdapter from './common/adapter/page-alert-feishu-adapter';
import RequestAlertFeishuAdapter from './common/adapter/request-alert-feishu-adapter';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AlertClient)),
    HttpModule,
  ],
  controllers: [
    AlertMsgController,
    FeishuEventController,
    FeishuCallbackController,
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
    FeishuCallbackService,
    SentryWebhookService,
    AlertFeishuAdapter,
    PageAlertFeishuAdapter,
    RequestAlertFeishuAdapter,
    SentryApiService,
    PageErrorService,
    RequestErrorService,
  ],
  exports: [AlertMsgService, FeishuEventService, SentryWebhookService],
})
export class AlertModule {}
