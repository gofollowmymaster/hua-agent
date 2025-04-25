import { Module } from '@nestjs/common';
import { AlertMsgController } from './alert-message.controller';
import { AlertMsgService } from './alert-message.service';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { FeishuHelperModule } from '@src/common/feishu/hepler/helper.module';
import { FeishuApp } from '@src/common/feishu/clients/enum';
import { FeishuTableModule } from '@src/common/feishu/table/table.module';
import SentryApiAlertAdapter from './adapter/sentry-alert-adapter';
import { ClientFactory } from '@src/common/feishu/clients';
@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AlertClient)),
    FeishuTableModule,
  ],
  controllers: [AlertMsgController],
  providers: [
    AlertMsgService,
    PrismaService,
    LoggerService,
    SentryApiAlertAdapter,
  ],
  exports: [AlertMsgService],
})
export class AlertMsgModule {}
