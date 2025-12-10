import { Injectable, UseGuards } from '@nestjs/common';
import {
  SearchParamsDto,
  MessageFromRobotDto,
  FeishuMessageSenderDto,
  FeishuTicketDto,
} from './dto/post-message-from-robot.dto';
import { listTableRecord } from '@src/common/utils/actionTable/listTableRecord';
import { addTableRecord } from '@src/common/utils/actionTable/addTableRecord';
import { searchTableRecord } from '@src/common/utils/actionTable/searchTableRecord';
import { updateTableRecord } from '@src/common/utils/actionTable/updateTableRecord';
import { deleteTableRecord } from '@src/common/utils/actionTable/deleteTableRecord';
import { feishuSenceService } from './logic/feishu.sence.service';
import { removeAtXiaoA } from './logic';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { ReceiveIdType } from '@src/common/feishu/type/im';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@src/common/guard/auth';
import { getAppAccessToken } from '@src/common/feishu/utils';
import { logger } from '@src/common/service/logger/logger.config';
@Injectable()
export class RobotService {
  constructor(
    private readonly feishuSence: feishuSenceService,
    private readonly messageHelper: FeishuMessageHelper,
    private readonly httpService: HttpService,
  ) {}
  async getList(headers: { appToken: string; tableId: string }) {
    const { appToken, tableId } = headers;
    const res = await listTableRecord(appToken, tableId);
    return res;
  }

  async createRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { records } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await addTableRecord(appToken, tableId, records);
    return res;
  }

  async searchRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { data } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await searchTableRecord(appToken, tableId, data);
    return res;
  }

  async updateRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { record_id, records } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await updateTableRecord(appToken, tableId, record_id, records);
    return res;
  }

  async deleteRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { record_id } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await deleteTableRecord(appToken, tableId, record_id);
    return res;
  }

  async feishuFlowMessage(
    MessageFromRobot: MessageFromRobotDto,
    headers: { appToken: string; tableId: string },
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
      const res = await this.feishuSence.runSenceOne(MessageFromRobot, headers);
      logger.info('res-------', res);
      return res;
    }
    // 场景 3 使用引用消息 @小A 但是@小A后有内容 则认为为这是一个需要记录的回复（“引用消息”就作为本次回复内容，需要去表里面查找是否有对应的问题）
    if (originalContent && replyContent) {
      MessageFromRobot.replyContent = removeAtXiaoA(
        MessageFromRobot.replyContent,
      );
      const res = await this.feishuSence.runSenceTwo(MessageFromRobot, headers);
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
