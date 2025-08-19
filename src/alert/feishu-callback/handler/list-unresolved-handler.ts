import { CardCallbackReturnType } from '@src/common/feishu/type/card';
import { CustomCallbackHandleType } from '.';
// import { UnresolvedCardData } from '@src/common/feishu/card/error-unresolve-card';

const listUnresolvedHandler: CustomCallbackHandleType = async (
  event,
  handerService,
): Promise<CardCallbackReturnType> => {
  const {
    operator: { open_id },
    action: {
      value: { period, errorEndpoint, busibessLine },
    },
  } = event;
  const service = await handerService.alertStatisticService;
  //   service.
  service.pushIssueCardToUser({
    busibessLine,
    userId: open_id,
    errorEndpoint,
    period,
  });
  return {
    toast: {
      type: 'info',
      content: '发送成功',
      i18n: {
        zh_cn: '发送成功',
        en_us: 'card action success',
      },
    },
  };
};
export default listUnresolvedHandler;
