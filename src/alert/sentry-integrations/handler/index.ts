import MsgReadHandler from './msg-read-handler';
import MsgReactionHandler from './msg-reaction-handler';
import { EventHandles } from '@larksuiteoapi/node-sdk';
import { SentryWebhookService } from '../webhook.service';

type EventHandlerParameters<T extends keyof EventHandles> = Parameters<
  EventHandles[T]
>[0];
export type CustomEventHandleType<T extends keyof EventHandles> = (
  event: EventHandlerParameters<T>,
  service: SentryWebhookService,
) => ReturnType<EventHandles[T]>;

const EventHandler = {
  'im.message.message_read_v1': MsgReadHandler,
  'im.message.receive_v1': async () => {},
  'im.message.reaction.created_v1': MsgReactionHandler,
};
export default EventHandler;
