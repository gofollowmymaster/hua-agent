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

    this.logger.info(
      "[ dayjs().format('YYYY-MM-DD HH') ] >",
      dayjs(alertInfo.timeStamp * 1000).format('YYYY-MM-DD HH'),
    );
    return { data: isNeedSendAlertMsg(alertInfo.timeStamp) };
  }
  @Post('readMsgCallback')
  // 接收已读webhook
  async readMsgCallback(@Body() callbackInfo: ReadMsgCallbackDto) {
    // 标记已读
    await this.alertMsgService.markAsReaded(
      callbackInfo.event.message_id_list[0],
    );
    return { list: [] };
  }

  @Post('readMsgCallback')
  // 接收已表情回复webhook
  async reactionMsgCallback(@Body() callbackInfo: SentryAlertDto) {
    console.log('[readMsg]:', callbackInfo);
    return { list: [] };
  }
  @Post('callback')
  // 接收已表情回复webhook
  async feishuEventCallback(@Body() callbackInfo: SentryAlertDto) {
    console.log('[readMsg]:', callbackInfo);
    return { list: [] };
  }
}
