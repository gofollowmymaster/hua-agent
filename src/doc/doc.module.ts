import { Module } from '@nestjs/common';
import { WikiController } from './wiki/wiki.controller';
import { WikiService } from './wiki/wiki.service';
import { PrismaService } from '@src/common/service/prisma/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';

import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import WikiDirectoryService from './common/schedule/wiki-directory';
import WikiBlackListTable from './common/table/black-list';
import { CheckDocumentProcessor } from './common/processor/check-document';
import { BullModule } from '@nestjs/bullmq';
import configuration from '@src/config';
import { WarningMsgService } from './common/processor/warning-msg-service';
import { WikiMsgSenderService } from './common/processor/check-msg-sender';
import { AlertContext } from '@src/common/base/alert-event.context';
import { WikiAlertFeishuAdapter } from './common/processor/alert-feishu.adapter';
import { HttpModule } from '@nestjs/axios';
import WikiSensitiveWordsCheckService from './common/schedule/wiki-sensitive-words-check';
import WikiFeedbackTable from './common/table/feedback';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.WikiClient)),
    BullModule.forRoot({
      connection: {
        host: configuration['DB_REDIS_HOST'], // 你的 Redis 服务器地址
        password: configuration['DB_REDIS_PASSWORD'], // 你的 Redis 服务器端口
        db: configuration['DB_REDIS_DB'], // 选择的 Redis 数据库
      },
    }),
    // 注册一个名为 'syncDocument' 的队列
    BullModule.registerQueue({
      name: 'check-document',
      // 可选的默认任务选项，例如设置重试策略
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
        },
        removeOnComplete: 100,
      },
    }),
    HttpModule,
  ],

  controllers: [WikiController],
  providers: [
    WikiService,
    PrismaService,
    LoggerService,
    WikiDirectoryService,
    WikiBlackListTable,
    WikiFeedbackTable,
    CheckDocumentProcessor,
    WarningMsgService,
    WikiMsgSenderService,
    AlertContext,
    WikiAlertFeishuAdapter,
    WikiSensitiveWordsCheckService,
  ],
  exports: [WikiService],
})
export class DocModule {}
