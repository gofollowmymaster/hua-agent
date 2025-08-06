import AssignToHandler from './assign-to-handler';
import ModifyStatusHandler from './modify-status-handler';
import CloseHandler from './close-handler';
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
  assignTo: AssignToHandler,
  modifyStatus: ModifyStatusHandler,
  close: CloseHandler,
};
export default EventHandler;
