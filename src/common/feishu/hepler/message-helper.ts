import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CreateMessageType } from './interface';
import { FeishuApiException } from '@src/common/exception/feishu-api-exception';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuMessageHelper {
  constructor(
    // private readonly config: ConfigService,
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
  ) {}
  async create(msgParams: CreateMessageType) {
    const { code, data } =
      await this.client.client.im.message.create(msgParams);
    if (code !== 0) {
      throw new FeishuApiException();
    }
    return data;
  }
  async createToGroup(msgParams: CreateMessageType['data']) {
    return await this.create({
      data: msgParams,
      params: {
        receive_id_type: 'chat_id',
      },
    });
  }
  async createInteractToGroup(content, feishuGroupId) {
    return await this.createToGroup({
      receive_id: feishuGroupId,
      msg_type: 'interactive',
      content,
    });
  }
  async reply(content: string, messageId: string) {
    return await this.client.client.im.message.reply({
      data: {
        msg_type: 'text',
        content,
      },
      path: {
        message_id: messageId,
      },
    });
  }
  async urgentPhone(userId: string[], messageId: string) {
    return await this.client.client.im.message.urgentPhone({
      data: {
        user_id_list: [...userId],
      },
      params: {
        user_id_type: 'user_id',
      },
      path: {
        message_id: messageId,
      },
    });
  }
}

export default FeishuMessageHelper;
