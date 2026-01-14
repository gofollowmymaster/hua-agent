import AssignToHandler from './assign-to-handler';
import ModifyStatusHandler from './modify-status-handler';
import listUnresolvedHandler from './list-unresolved-handler';
import CloseHandler from './close-handler';
// import MsgReactionHandler from './msg-reaction-handler';
// import { EventHandles } from '@larksuiteoapi/node-sdk';
import { FeishuCallbackService } from '../callback.service';
import { CallbackEventDto } from '../dto/feishu-callback.dto';
import { CardCallbackReturnType } from '@src/common/feishu/type/card';
import { UnresolvedCardData } from '@src/common/feishu/card/warning-card/interface';

// type CallbackHandlerParameters<T extends keyof EventHandles> = Parameters<
//   EventHandles[T]
// >[0];
export type CustomCallbackHandleType = (
  event: CallbackEventDto,
  service: FeishuCallbackService,
) => Promise<CardCallbackReturnType<UnresolvedCardData>>;

const EventHandler = {
  assignTo: AssignToHandler,
  modifyStatus: ModifyStatusHandler,
  close: CloseHandler,
  listUnresolved: listUnresolvedHandler,
};
export default EventHandler;
