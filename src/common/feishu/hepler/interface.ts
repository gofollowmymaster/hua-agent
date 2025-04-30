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

export type CreateMessageType = {
  data: {
    receive_id: string;
    msg_type: `${FeishuMsgType}`;
    content: string;
    uuid?: string;
  };
  params: {
    receive_id_type: `${ReceiveIdType}`;
  };
};
