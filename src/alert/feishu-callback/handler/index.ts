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
import PublishCancelHandler from './publish-cancel-handler';
import PublishConfirmHandler from './publish-confirm-handler';

export type CustomCallbackHandleType = (
  event: CallbackEventDto,
  service: FeishuCallbackService,
) => Promise<CardCallbackReturnType<any>>;

const EventHandler = {
  assignTo: AssignToHandler,
  modifyStatus: ModifyStatusHandler,
  close: CloseHandler,
  listUnresolved: listUnresolvedHandler,
  batchCancel: PublishCancelHandler,
  batchConfirm: PublishConfirmHandler,
};
export default EventHandler;
