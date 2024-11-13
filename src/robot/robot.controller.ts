import { Body, Controller, Post } from '@nestjs/common';
import { RobotService } from './robot.service';
import { MessageFromRobotDto } from './dto/post-message-from-robot.dto';
@Controller('from-robot-message')
export class RobotController {
  constructor(private readonly robotService: RobotService) {}

  @Post()
  async postMessageFromRobot(@Body() MessageFromRobot: MessageFromRobotDto) {
    return this.robotService.getMessageFromRobot(MessageFromRobot);
  }
}
