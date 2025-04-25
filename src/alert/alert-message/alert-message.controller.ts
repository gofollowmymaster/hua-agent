import { Body, Controller, Post } from '@nestjs/common';

import { SentryAlertDto } from './dto/sentry-alert.dto';
import { AlertMsgService } from './alert-message.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SentryRawDto } from './dto/sentry-raw.dto';
// import SentryAdapter from './adapter/sentry-apialert-adapter';

@ApiTags('飞书消息报警')
@Controller('alert-message')
export class AlertMsgController {
  constructor(
    private readonly alertMsgService: AlertMsgService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  @ApiOperation({
    summary: '飞书sentry连接器发送报警消息',
    description: '发送飞书报警消息，非节假日指定时段会电话通知',
  })
  @ApiBody({ type: SentryAlertDto })
  @Post('send')
  async sendMsg(@Body() alertInfo: SentryAlertDto) {
    //发送消息
    return await this.alertMsgService.sendFsAlertMsg(alertInfo);
  }
  @ApiOperation({
    summary: 'sentry直连报警消息通知',
    description: '处理sentry报警消息通知',
  })
  @ApiBody({ type: SentryRawDto })
  @Post('alertRaw')
  async sentryAlert(@Body() alertInfo: SentryRawDto) {
    // 添加到多维表格
    return await this.alertMsgService.sentryAlertHook(alertInfo);
  }

  @ApiOperation({
    summary: '业务线列表',
    description: '飞书业务线列表信息',
  })
  @ApiBody({ type: SentryRawDto })
  @Post('business-line-list')
  async aplusBussnessList() {
    // 添加到多维表格
    return await this.alertMsgService.loadFeishuAplusBussnessList();
  }
}
