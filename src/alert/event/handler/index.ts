import MsgReadHandler from './msg-read-handler';
import MsgReactionHandler from './msg-reaction-handler';
import MsgReceiveHandler from './msg-receive-handler';
import { EventHandles } from '@larksuiteoapi/node-sdk';
import { FeishuEventService } from '../event.service';

type EventHandlerParameters<T extends keyof EventHandles> = Parameters<
  EventHandles[T]
>[0];
export type CustomEventHandleType<T extends keyof EventHandles> = (
  event: EventHandlerParameters<T>,
  service: FeishuEventService,
) => ReturnType<EventHandles[T]>;

const EventHandler = {
  'im.message.message_read_v1': MsgReadHandler,
  'im.message.receive_v1': MsgReceiveHandler,
  'im.message.reaction.created_v1': MsgReactionHandler,
};
export default EventHandler;
