import { Module } from '@nestjs/common';
import { RobotController } from './robot.controller';
import { RobotService } from './robot.service';
import { feishuSenceService } from './logic/feishu.sence.service';
import { FeishuHelperModule } from '@src/common/feishu/hepler/helper.module';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.XiaoAClient)),
  ],

  controllers: [RobotController],
  providers: [RobotService, feishuSenceService],
  exports: [RobotService],
})
export class RobotModule {}
