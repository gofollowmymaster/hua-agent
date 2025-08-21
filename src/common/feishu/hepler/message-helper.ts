import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import {
  CreateMessageType,
  FeishuMessageCreateReturnBody,
  FeishuMsgType,
} from '../type/im';
import FeishuApiHelper from './feishu-api-helper';
import { UserIdType } from '../type/contact';
// import { HttpService } from '@nestjs/axios';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuMessageHelper extends FeishuApiHelper {
  constructor(@Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient) {
    super();
  }

  async create(
    msgParams: CreateMessageType,
  ): Promise<FeishuMessageCreateReturnBody> {
    return await this.requestWrapper(async () => {
      return await this.client.client.im.message.create(msgParams);
    }, 'message-create');
  }
  async createToUser(
    msgParams: CreateMessageType['data'],
    receiveIdType: UserIdType = 'open_id',
  ) {
    return await this.create({
      data: msgParams,
      params: {
        receive_id_type: receiveIdType,
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
    }, 'message-reply');
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
    }, 'message-urgentPhone');
  }
  async urgentApp(
    userId: string[],
    messageId: string,
    userIdType: UserIdType = 'user_id',
  ) {
    return this.requestWrapper(async () => {
      return await this.client.client.im.message.urgentApp({
        data: {
          user_id_list: [...userId],
        },
        params: {
          user_id_type: userIdType,
        },
        path: {
          message_id: messageId,
        },
      });
    }, 'message-urgentApp');
  }
  async forwardThread(
    receiveId: string,
    threadId: string,
    receiveIdType: UserIdType = 'user_id',
  ) {
    return this.requestWrapper(async () => {
      return await this.client.client.im.thread.forward({
        data: {
          receive_id: receiveId,
        },
        params: {
          receive_id_type: receiveIdType,
        },
        path: {
          thread_id: threadId,
        },
      });
    }, 'forwardThread');
  }
}

export default FeishuMessageHelper;
