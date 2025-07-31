import MsgCardHandler from './msg-read-handler';
import MsgReactionHandler from './msg-reaction-handler';
import { EventHandles } from '@larksuiteoapi/node-sdk';
import { FeishuCallbackService } from '../callback.service';

type CallbackHandlerParameters<T extends keyof EventHandles> = Parameters<
  EventHandles[T]
>[0];
export type CustomCallbackHandleType<T extends keyof EventHandles> = (
  event: CallbackHandlerParameters<T>,
  service: FeishuCallbackService,
) => ReturnType<EventHandles[T]>;

const EventHandler = {
  'card.action.trigger': MsgCardHandler,
  'im.message.reaction.created_v1': MsgReactionHandler,
};
export default EventHandler;
