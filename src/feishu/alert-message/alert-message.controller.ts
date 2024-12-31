import { Body, Controller, Post } from '@nestjs/common';

import { ReadMsgCallbackDto, SentryAlertDto } from './dto/sentry-alert.dto';
import { AlertMsgService } from './alert-message.service';
import { isNeedSendAlertMsg } from './utils';
import { LoggerService } from '@src/common/service/logger/logger.service';
import dayjs from 'dayjs';

@Controller('alert-message')
export class AlertMsgController {
  constructor(
    private readonly alertMsgService: AlertMsgService,
    private readonly logger: LoggerService,
  ) {}

  @Post('send')
  async sendMsg(@Body() alertInfo: SentryAlertDto) {
    dayjs.tz.setDefault('America/New_York');

    //写入多维表格

    //发送消息
    // if (isNeedSendAlertMsg(alertInfo.timeStamp)) {
    this.alertMsgService.sendFsAlertMsg(alertInfo);
    // }

   
    return { data: isNeedSendAlertMsg(alertInfo.timeStamp) };
  }



}
