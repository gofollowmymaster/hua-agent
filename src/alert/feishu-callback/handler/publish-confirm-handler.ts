import { CustomCallbackHandleType } from '.';
import { CardCallbackReturnType } from '@src/common/feishu/type/card';
import { PublishCardWaitingData } from '@src/common/feishu/card/project-publish-waiting';
import { CardDataType } from '@src/common/feishu/card/feishu-card';

const PublishConfirmHandler: CustomCallbackHandleType = async (
  event,
  handlerService,
): Promise<CardCallbackReturnType<PublishCardWaitingData>> => {
  const {
    operator: { union_id },
    action: {
      value: { runId },
    },
  } = event;

  const card: CardDataType<PublishCardWaitingData> =
    await handlerService.publishCallbackService.passPublish(runId, union_id);
  return {
    toast: {
      type: 'info',
      content: '处理成功',
      i18n: {
        zh_cn: '处理成功',
        en_us: 'card action success',
      },
    },
    card,
  };
};
export default PublishConfirmHandler;
