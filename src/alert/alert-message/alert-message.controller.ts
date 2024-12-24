import { Body, Controller, Post } from '@nestjs/common';

import { SentryAlertDto } from './dto/sentry-alert.dto';
import { AlertMsgService } from './alert-message.service';
import { isNeedSendAlertMsg } from './utils';

@Controller('alert-message')
export class AlertMsgController {
  constructor(private readonly alertMsgService: AlertMsgService) {}

  @Post('send')
  async sendMsg(@Body() alertInfo: SentryAlertDto) {
    //写入多维表格

    //发送消息
    if (isNeedSendAlertMsg()) {
      this.alertMsgService.sendFsAlertMsg(alertInfo);
    }
  }
  @Post('readMsgCallback')
  // 接收已读webhook
  async readMsgCallback(@Body() callbackInfo: SentryAlertDto) {
    console.log('[readMsg]:', callbackInfo);
  }

  @Post('readMsgCallback')
  // 接收已表情回复webhook
  async reactionMsgCallback(@Body() callbackInfo: SentryAlertDto) {
    console.log('[readMsg]:', callbackInfo);
  }
}
