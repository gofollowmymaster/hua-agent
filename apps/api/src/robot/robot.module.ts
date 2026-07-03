import { Module } from '@nestjs/common';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { HttpModule } from '@nestjs/axios';
import { TableController } from './table/table.controller';
import { MessageController } from './message/message.controller';
import { TableService } from './table/table.service';
import { MessageService } from './message/message.service';
import { FeishuSenseService } from './message/logic/feishu.sense.service';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.XiaoAClient)),
    HttpModule,
  ],

  controllers: [TableController, MessageController],
  providers: [TableService, MessageService, FeishuSenseService],
})
export class RobotModule {}
