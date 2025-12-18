import { Injectable, UseGuards } from '@nestjs/common';
import {
  MessageFromRobotDto,
  FeishuMessageSenderDto,
  FeishuTicketDto,
} from './post-message-from-robot.dto';

import { FeishuSenseService } from './logic/feishu.sense.service';
import { removeAtXiaoA } from './logic';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import { ReceiveIdType } from '@src/common/feishu/type/im';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@src/common/guard/auth';
import { getAppAccessToken } from '@src/common/feishu/utils';
import { logger } from '@src/common/service/logger/logger.config';
import { TableHeaderType } from '../dto/table-action.dto';
@Injectable()
export class MessageService {
  constructor(
    private readonly feishuSense: FeishuSenseService,
    private readonly messageHelper: FeishuMessageHelper,
    private readonly httpService: HttpService,
  ) {}

  async feishuFlowMessage(
    MessageFromRobot: MessageFromRobotDto,
    headers: TableHeaderType,
  ) {
    logger.warn(
      '【feishuFlowMessage】请求入参格式: ',
      `【${MessageFromRobot}】`,
    );
    // 场景 1 @小A 这是一个问题 但消息内容上无引用内容 则认为为这是一个需要记录的问题
    // 场景 2 使用引用消息 @小A 但是@小A后无内容 则同样认为为这是一个需要记录的问题

    const { originalContent, replyContent } = MessageFromRobot;
    if (
      (originalContent !== '' && replyContent == '') ||
      (originalContent == '' && replyContent !== '')
    ) {
      const res = await this.feishuSense.runSenseOne(MessageFromRobot, headers);
      logger.info('res-------', res);
      return res;
    }
    // 场景 3 使用引用消息 @小A 但是@小A后有内容 则认为为这是一个需要记录的回复（“引用消息”就作为本次回复内容，需要去表里面查找是否有对应的问题）
    if (originalContent && replyContent) {
      MessageFromRobot.replyContent = removeAtXiaoA(
        MessageFromRobot.replyContent,
      );
      const res = await this.feishuSense.runSenseTwo(MessageFromRobot, headers);
      logger.info('res-------', res);
      return res;
    }
  }

  async sendFeishuMessage(params: FeishuMessageSenderDto) {
    if (
      params.receive_id_type &&
      params.receive_id_type != ReceiveIdType.ChatId
    ) {
      return await this.messageHelper.create({
        data: {
          receive_id: params.receive_id,
          msg_type: params.msg_type,
          content: params.content,
        },
        params: {
          receive_id_type: params.receive_id_type,
        },
      });
    }

    return await this.messageHelper.createToGroup({
      receive_id: params.receive_id,
      msg_type: params.msg_type,
      content: params.content,
    });
  }

  @ApiOperation({
    summary: '获取飞书机器人认证票据',
    description: '获取飞书机器人认证票据，web端小组件使用',
  })
  @UseGuards(AuthGuard)
  async getTicket(params: FeishuTicketDto) {
    const appAccessToken = await getAppAccessToken(params.appName);
    const {
      data: { data },
    } = await firstValueFrom(
      this.httpService.post(
        'https://open.feishu.cn/open-apis/jssdk/ticket/get',
        {},
        {
          headers: { Authorization: `Bearer ${appAccessToken}` },
        },
      ),
    );
    return data;
  }
}
