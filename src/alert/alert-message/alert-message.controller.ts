import { Body, Controller, Post } from '@nestjs/common';

import { SentryAlertDto } from './dto/sentry-alert.dto';
import { AlertMsgService } from './alert-message.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Controller('alert-message')
export class AlertMsgController {
  constructor(
    private readonly alertMsgService: AlertMsgService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  @Post('send')
  async sendMsg(@Body() alertInfo: SentryAlertDto) {
    //写入多维表格

    //发送消息
    await this.alertMsgService.sendFsAlertMsg(alertInfo);

    // return { data: this.config.get('DATABASE_URL') };
  }
}
