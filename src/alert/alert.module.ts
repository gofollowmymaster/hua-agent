import { Module } from '@nestjs/common';
import { AlertMsgController } from './alert-message/alert-message.controller';
import { PrismaService } from '@src/common/service/prisma/prisma.service';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';

// import { FeishuTableModule } from '@src/common/feishu/table/table.module';
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
import { SentryIssueService } from './common/service/sentry/sentry-issue-service';
import { HttpModule } from '@nestjs/axios';
import { PageErrorService } from './common/service/page-error-service';
import { RequestErrorService } from './common/service/request-error-service';
import PageAlertFeishuAdapter from './common/adapter/page-alert-feishu-adapter';
import RequestAlertFeishuAdapter from './common/adapter/request-alert-feishu-adapter';
import AlertStatisticService from './common/schedule/alert-statistic';
import RequestIssueStatisticService from './common/schedule/alert-statistic/services/request-issue.service';
import PageIssueStatisticService from './common/schedule/alert-statistic/services/page-issue.service';
import ClearAlertPerDayService from './common/schedule/clear-alert-issue';
import PageClearIssueService from './common/schedule/clear-alert-issue/services/page-issue.service';
import RequestClearIssueService from './common/schedule/clear-alert-issue/services/request-issue.service';
import { FeishuReceiveCallback } from './event/handler/receive-handler';
import SyncFeishuUser from './common/schedule/sync-feishu-user';
import { SentryProjectService } from './common/service/sentry/sentry-project-service';
import { MsgAlertService } from './common/service/msg-alert.service';
import { AlertContext } from '@src/common/base/alert-event.context';

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
    PrismaService,
    SentryProjectService,

    FeishuEventService,
    FeishuCallbackService,
    SentryWebhookService,
    PageAlertFeishuAdapter,
    RequestAlertFeishuAdapter,
    SentryIssueService,
    PageErrorService,
    RequestErrorService,
    AlertStatisticService,
    RequestIssueStatisticService,
    PageIssueStatisticService,
    ClearAlertPerDayService,
    PageClearIssueService,
    RequestClearIssueService,
    FeishuReceiveCallback,
    SyncFeishuUser,
    MsgAlertService,
    AlertContext,
  ],
  exports: [FeishuEventService, SentryWebhookService, AlertStatisticService],
})
export class AlertModule {}
