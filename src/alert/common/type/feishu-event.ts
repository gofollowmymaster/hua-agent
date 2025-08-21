import { EventHandles } from '@larksuiteoapi/node-sdk';

export type EventHandlerParameters<T extends keyof EventHandles> = Parameters<
  EventHandles[T]
>[0];

export type ReceiveEventParams =
  EventHandlerParameters<'im.message.receive_v1'>;

export type MsgReadEventParams =
  EventHandlerParameters<'im.message.message_read_v1'>;

export type ReactionCreatedEventParams =
  EventHandlerParameters<'im.message.reaction.created_v1'>;
