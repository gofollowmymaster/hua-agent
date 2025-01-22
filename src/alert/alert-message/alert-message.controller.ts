import { Body, Controller, Post } from '@nestjs/common';

import { SentryAlertDto } from './dto/sentry-alert.dto';
import { AlertMsgService } from './alert-message.service';
import { LoggerService } from '@src/common/service/logger/logger.service';

@Controller('alert-message')
export class AlertMsgController {
  constructor(
    private readonly alertMsgService: AlertMsgService,
    private readonly logger: LoggerService,
  ) {}

  @Post('send')
  async sendMsg(@Body() alertInfo: SentryAlertDto) {
    //写入多维表格

    //发送消息
    this.alertMsgService.sendFsAlertMsg(alertInfo);

    return { data: process.env.NODE_ENV };
  }
}
