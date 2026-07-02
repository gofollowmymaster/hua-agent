import type {
  BaseMessage,
  EventMessageWith,
  EnterChatEvent,
  TextMessage,
  WsFrame,
} from '@wecom/aibot-node-sdk';

export type WecomTextMessageFrame = WsFrame<TextMessage>;
export type WecomBaseMessageFrame = WsFrame<BaseMessage>;
export type WecomEnterChatFrame = WsFrame<EventMessageWith<EnterChatEvent>>;

export interface WecomRagMessageContext {
  msgId: string;
  chatId: string;
  userId: string;
  chatType: 'single' | 'group';
  question: string;
}
