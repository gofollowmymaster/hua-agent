import { CardCallbackReturnType } from '@src/common/feishu/type/card';
import { CustomCallbackHandleType } from '.';
// import { UnresolvedCardData } from '@src/common/feishu/card/error-unresolved-card';

const listUnresolvedHandler: CustomCallbackHandleType = async (
  event,
  handerService,
): Promise<CardCallbackReturnType> => {
  const {
    operator: { open_id },
    action: {
      value: { period, errorEndpoint, businessLine },
    },
  } = event;
  const service = await handerService.alertStatisticService;
  //   service.
  service.pushIssueCardToUser({
    businessLine,
    userId: open_id,
    errorEndpoint,
    period,
  });
  return {
    toast: {
      type: 'info',
      content: '所有未解决问题以发送给您',
      i18n: {
        zh_cn: '所有未解决问题以发送给您',
        // en_us: 'card action success',
      },
    },
  };
};
export default listUnresolvedHandler;
