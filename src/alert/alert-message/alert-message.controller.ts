import { Body, Controller, Post } from '@nestjs/common';

import { SentryAlertDto } from './dto/sentry-alert.dto';
import { AlertMsgService } from './alert-message.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('飞书消息报警')
@Controller('alert-message')
export class AlertMsgController {
  constructor(
    private readonly alertMsgService: AlertMsgService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  @ApiOperation({
    summary: '发送报警消息',
    description: '发送飞书报警消息，非节假日指定时段会电话通知',
  })
  @ApiBody({ type: SentryAlertDto })
  @Post('send')
  async sendMsg(@Body() alertInfo: SentryAlertDto) {
    //发送消息
    await this.alertMsgService.sendFsAlertMsg(alertInfo);

    // return { data: this.config.get('DATABASE_URL') };
  }
}
