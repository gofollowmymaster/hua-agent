import { Body, Controller, Post } from '@nestjs/common';

import { SentryAlertDto } from './dto/sentry-alert.dto';
import { AlertMsgService } from './alert-message.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SentryRawDto, updateIssueDto } from './dto/sentry-raw.dto';

@ApiTags('飞书消息报警')
@Controller('alert-message')
export class AlertMsgController {
  constructor(private readonly alertMsgService: AlertMsgService) {}

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
  // @ApiOperation({
  //   summary: '修改Issue状态',
  //   description: '修改Issue状态',
  // })
  // @ApiBody({ type: updateIssueDto })
  // @Post('updateIssue')
  // async updateIssue(@Body() alertInfo: updateIssueDto) {
  //   // 添加到多维表格
  //   return await this.alertMsgService.updateIssue(alertInfo);
  // }
}
