import assignToHandler from './assign-to-handler';
// import MsgReactionHandler from './msg-reaction-handler';
// import { EventHandles } from '@larksuiteoapi/node-sdk';
import { FeishuCallbackService } from '../callback.service';
import { CallbackEventDto } from '../dto/feishu-callback.dto';

// type CallbackHandlerParameters<T extends keyof EventHandles> = Parameters<
//   EventHandles[T]
// >[0];
export type CustomCallbackHandleType = (
  event: CallbackEventDto,
  service: FeishuCallbackService,
) => any;

const EventHandler = {
  assignTo: assignToHandler,
  // 'im.message.reaction.created_v1': MsgReactionHandler,
};
export default EventHandler;
