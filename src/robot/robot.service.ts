import { Injectable } from '@nestjs/common';
import { MessageFromRobotDto } from './dto/post-message-from-robot.dto';

@Injectable()
export class RobotService {
  getMessageFromRobot(MessageFromRobot: MessageFromRobotDto) {
    return MessageFromRobot;
  }
}
