import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { AliController } from './ali/ali.controller';
import { AliService } from './ali/ali.service';
import { DevopsApiService } from './ali/common/ali-api/ali-devops.helper';
import { AliCodeUpApiService } from './ali/common/ali-api/ali-codeup.helper';
import { DevopsOptionService } from './ali/common/service/devops-option.service';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import UserAliyunTable from './ali/common/table/user-token-table';
import { AliDevopsContext } from './ali/common/service/ali-devops.context';
import CancelExecutionServer from './ali/common/schedule/cancel-execution';
import configuration from '@src/config';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    HttpModule,
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AiHelperClient)),
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
  providers: [
    LoggerService,
    AliService,
    DevopsApiService,
    AliCodeUpApiService,
    DevopsOptionService,
    UserAliyunTable,
    AliDevopsContext,
    CancelExecutionServer,
  ],
  controllers: [AliController],
})
export class DevopsModule {}
