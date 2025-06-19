import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { LogOperatorDto } from './dto/log-operator.dto';
import { LogOperatorService } from './log-operator.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@src/common/guard/auth';
// import SentryAdapter from './adapter/sentry-apialert-adapter';

@ApiTags('ai问答日志操作器')
@Controller('log-operator')
export class LogOperatorController {
  constructor(private readonly logOperatorService: LogOperatorService) {}

  @ApiOperation({
    summary: '记录日志操作人',
    description: '添加一条日志操作人记录，用于后期同步到日志表格',
  })
  @ApiBody({ type: LogOperatorDto })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @UseGuards(AuthGuard)
  @Post('add')
  async add(@Body() alertInfo: LogOperatorDto) {
    //发送消息
    return await this.logOperatorService.add(alertInfo);
  }
}
