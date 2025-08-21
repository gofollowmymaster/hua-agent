import * as lark from '@larksuiteoapi/node-sdk';

export type FeishuMessageCreateParams = Parameters<
  lark.Client['im']['message']['create']
>;

export type FeishuMessageCreateReturn = Awaited<
  ReturnType<lark.Client['im']['message']['create']>
>;
export type FeishuMessageCreateReturnBody = FeishuMessageCreateReturn['data'];

export enum FeishuMsgType {
  Text = 'text',
  Post = 'post',
  Image = 'image',
  File = 'file',
  Audio = 'audio',
  Media = 'media',
  Sticker = 'sticker',
  Interactive = 'interactive',
  ShareChat = 'share_chat',
  ShareUser = 'share_user',
}

export enum ReceiveIdType {
  OpenId = 'open_id',
  UserId = 'user_id',
  UnionId = 'union_id',
  Email = 'email',
  ChatId = 'chat_id',
}

export type CreateMessageType = FeishuMessageCreateParams[0];

//im.message.create
