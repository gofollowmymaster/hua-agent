import { Body, Controller, Post, Headers } from '@nestjs/common';
import { MessageService } from './message.service';
import {
  FeishuCardMessageSenderDto,
  FeishuMessageSenderDto,
  FeishuTicketDto,
  MessageFromRobotDto,
} from './post-message-from-robot.dto';

import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { records } from '@src/common/utils/actionTable/interface';
import { AplusResponse } from '@src/type/global';
@ApiTags('飞书机器人消息快捷操作')
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

  //通用发送飞书卡片消息
  @ApiOperation({
    summary: '通用发送飞书卡片消息',
    description:
      '通用发送通用卡片消息到任何群或个人,消息体需遵循飞书消息富文本格式，具体参见文档:https://open.feishu.cn/document/feishu-cards/feishu-card-cardkit/components/markdown',
  })
  @ApiBody({ type: FeishuCardMessageSenderDto })
  @ApiOkResponse({ type: AplusResponse<records> })
  @Post('sendFeishuCardMessage')
  async sendFeishuCardMessage(
    @Body() MessageFromRobot: FeishuCardMessageSenderDto,
  ) {
    const res =
      await this.messageService.sendFeishuCardMessage(MessageFromRobot);
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
