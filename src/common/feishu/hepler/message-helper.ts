import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject } from '@nestjs/common';

class FeishuMessageHelper {
  constructor(
    // private readonly config: ConfigService,
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
  ) {}
  createInteractToGroup(content, feishuGroupId) {
    console.log('[ feishuGroupId ] >', feishuGroupId);
    return this.client.client.im.message.create({
      data: {
        receive_id: feishuGroupId,
        msg_type: 'interactive',
        content,
      },
      params: {
        receive_id_type: 'chat_id',
      },
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
