import { Module } from '@nestjs/common';
import { WikiController } from './wiki.controller';
import { WikiService } from './wiki.service';
import { PrismaService } from '@src/common/service/prisma/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';

import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import WikiDirectoryService from '../schedule/wiki-directory';
import WikiBlackListTable from '../common/table/black-list';
import { CheckDocumentProcessor } from '../common/processor/check-document';
import { BullModule } from '@nestjs/bullmq';
import configuration from '@src/config';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.XiaoAClient)),
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
  ],

  controllers: [WikiController],
  providers: [
    WikiService,
    PrismaService,
    LoggerService,
    WikiDirectoryService,
    WikiBlackListTable,
    CheckDocumentProcessor,
  ],
  exports: [WikiService],
})
export class WikiModule {}
