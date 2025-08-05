import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CreateMessageType, FeishuMsgType } from '../type/im';
import FeishuApiHelper from './feishu-api-helper';
import { RedisService } from '@src/common/service/redis/redis.service';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuMessageHelper extends FeishuApiHelper {
  constructor(
    // private readonly config: ConfigService,
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
  ) {
    super();
  }

  async create(msgParams: CreateMessageType) {
    return await this.requestWrapper(async () => {
      return await this.client.client.im.message.create(msgParams);
    });
  }
  async createToUser(msgParams: CreateMessageType['data']) {
    return await this.create({
      data: msgParams,
      params: {
        receive_id_type: 'user_id',
      },
    });
  }
  async createToGroup(msgParams: CreateMessageType['data']) {
    return await this.create({
      data: msgParams,
      params: {
        receive_id_type: 'chat_id',
      },
    });
  }
  async createInteractToGroup(content: string, feishuGroupId) {
    return await this.createToGroup({
      receive_id: feishuGroupId,
      msg_type: 'interactive',
      content,
    });
  }

  async reply(
    content: string,
    messageId: string,
    msgType: FeishuMsgType = FeishuMsgType.Text,
    replyInThread = false,
  ) {
    return this.requestWrapper(async () => {
      return await this.client.client.im.message.reply({
        data: {
          msg_type: msgType,
          content,
          reply_in_thread: replyInThread,
        },
        path: {
          message_id: messageId,
        },
      });
    });
  }
  async replyInThread(
    content: string,
    messageId: string,
    msgType: FeishuMsgType = FeishuMsgType.Text,
  ) {
    return await this.reply(content, messageId, msgType, true);
  }
  async urgentPhone(userId: string[], messageId: string) {
    return this.requestWrapper(async () => {
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
    });
  }
  async urgentApp(userId: string[], messageId: string) {
    return this.requestWrapper(async () => {
      return await this.client.client.im.message.urgentApp({
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
    });
  }

  async updateByCard(
    messageId: string,
    templateId: string,
    templateVersion: string,
    variables: Record<string, any>,
  ) {
    return this.requestWrapper(async () => {
      console.log('[ updateByCard ] >', {
        data: {
          template_id: templateId,
          template_variable: variables,
        },

        path: {
          message_id: messageId,
        },
      });
      // return;
      return await this.client.client.im.message.updateByCard({
        data: {
          template_id: templateId,
          // template_version_name: templateVersion,
          template_variable: variables,
          // msg_type: 'interactive',
        },

        path: {
          message_id: messageId,
        },
      });
    });
  }
}

export default FeishuMessageHelper;
