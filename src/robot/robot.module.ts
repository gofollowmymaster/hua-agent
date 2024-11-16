import { Module } from '@nestjs/common';
import { RobotController } from './robot.controller';
import { RobotService } from './robot.service';
import { feishuSence01Service } from './logic/feishu.sence01.service';

@Module({
  controllers: [RobotController],
  providers: [RobotService, feishuSence01Service],
  exports: [RobotService],
})
export class RobotModule {}
