import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { FeishuHelperModule } from '@src/common/feishu/hepler/helper.module';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { SyncController } from './sync/sync.controller';
import { SyncService } from './sync/sync.service';
import { BullModule } from '@nestjs/bullmq';
import configuration from '@src/config';
import { SyncDocumentProcessor } from './common/processor/push-document';

@Module({
  imports: [
    HttpModule,
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AiAlertClient)),
    // 配置 Bull 与 Redis 的连接
    BullModule.forRoot({
      connection: {
        host: configuration['DB_REDIS_HOST'], // 你的 Redis 服务器地址
        password: configuration['DB_REDIS_PASSWORD'], // 你的 Redis 服务器端口
        db: configuration['DB_REDIS_DB'], // 选择的 Redis 数据库
      },
    }),
    // 注册一个名为 'syncDocument' 的队列
    BullModule.registerQueue({
      name: 'sync-document',
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
  providers: [LoggerService, SyncService, SyncDocumentProcessor],
  controllers: [SyncController],
})
export class FdCopilotModule {}
