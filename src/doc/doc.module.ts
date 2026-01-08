import { Module } from '@nestjs/common';
import { FeishuEventController } from './event/event.controller';
import { FeishuEventService } from './event/event.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';

import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.XiaoLClient)),
  ],
  controllers: [FeishuEventController],
  providers: [FeishuEventService, LoggerService],
})
export class DocModule {}
