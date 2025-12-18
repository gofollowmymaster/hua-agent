import { Body, Controller, Post, Headers } from '@nestjs/common';
import { MessageService } from './message.service';
import {
  FeishuMessageSenderDto,
  FeishuTicketDto,
  MessageFromRobotDto,
} from './post-message-from-robot.dto';

import {
  ApiBody,
  ApiHeaders,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { records } from '@src/common/utils/actionTable/interface';
import { AplusResponse } from '@src/type/global';
@ApiTags('飞书机器人快捷操作')
@ApiHeaders([
  {
    name: 'appToken',
    description: '多维表格appToken',
  },
  {
    name: 'tableId',
    description: '多维表格appToken',
  },
])
@Controller('robot')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  //回复飞书消息
  @ApiOperation({
    summary: '回复飞书消息',
    description: '回复飞书消息',
  })
  @ApiBody({ type: MessageFromRobotDto })
  @ApiOkResponse({ type: AplusResponse<records> })
  @Post('feishuFlowMessage')
  async feishuFlowMessage(
    @Headers('appToken') appToken: string,
    @Headers('tableId') tableId: string,
    @Body() MessageFromRobot: MessageFromRobotDto,
  ) {
    const res = await this.messageService.feishuFlowMessage(MessageFromRobot, {
      appToken,
      tableId,
    });
    return res;
  }

  //通用发送飞书消息
  @ApiOperation({
    summary: '通用发送飞书消息',
    description:
      '通用发送飞书消息到任何群,消息体需遵循飞书结构，具体参见文档:https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json',
  })
  @ApiBody({ type: FeishuMessageSenderDto })
  @ApiOkResponse({ type: AplusResponse<records> })
  @Post('sendFeishuMessage')
  async sendFeishuMessage(@Body() MessageFromRobot: FeishuMessageSenderDto) {
    const res = await this.messageService.sendFeishuMessage(MessageFromRobot);
    return res;
  }

  // 通用机器人获取Ticket
  @ApiOperation({
    summary: '通用机器人获取Ticket',
    description: '通用机器人获取Ticket',
  })
  @ApiBody({ type: FeishuTicketDto })
  @ApiOkResponse({ type: AplusResponse<records> })
  @Post('getTicket')
  async getTicket(@Body() params: FeishuTicketDto) {
    const res = await this.messageService.getTicket(params);
    return res;
  }
}
