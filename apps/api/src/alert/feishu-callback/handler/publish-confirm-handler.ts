import { CustomCallbackHandleType } from '.';
import { CardCallbackReturnType } from '@src/common/feishu/type/card';
import { PublishCardData } from '@src/common/feishu/card/project-publish';

const PublishConfirmHandler: CustomCallbackHandleType = async (
  event,
  handlerService,
): Promise<CardCallbackReturnType<PublishCardData>> => {
  const {
    operator: { union_id },
    action: {
      value: { runId },
    },
  } = event;

  const { card, msg } = await handlerService.publishCallbackService.passPublish(
    runId,
    union_id,
  );
  return {
    toast: {
      type: 'info',
      content: msg,
      i18n: {
        zh_cn: msg,
        en_us: 'card action success',
      },
    },
    card,
  };
};
export default PublishConfirmHandler;
