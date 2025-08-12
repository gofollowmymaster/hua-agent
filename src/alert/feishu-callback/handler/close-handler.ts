import {
  CardCallbackReturnType,
  CardReturnType,
} from '@src/common/feishu/type/card';
import { CustomCallbackHandleType } from '.';

import ErrorClosedCard from '@src/common/feishu/card/error-closed-card';
import { UnresolvedCardData } from '@src/common/feishu/card/error-unresolve-card';

const CloseHandler: CustomCallbackHandleType = async (
  event,
  handerService,
): Promise<CardCallbackReturnType<UnresolvedCardData>> => {
  const {
    operator: { open_id },
    action: {
      value: { issueId },
      form_value: { reason, solution },
    },
  } = event;
  const service = await handerService.getServiceByIssueId(issueId);

  service.closeIssueHandler({
    issueId,
    operator: open_id,
    reason,
    solution,
  });

  const issueCardData = await service.checkIssueInCache(issueId);
  let cardReturn: CardReturnType<UnresolvedCardData>;
  if (issueCardData) {
    const statusLabel =
      issueCardData.status === '暂时忽略' ? issueCardData.status : '已关闭';
    cardReturn = {
      type: 'template',
      data: {
        template_id: ErrorClosedCard.templateId,
        template_version_name: ErrorClosedCard.templateVersion,
        template_variable: {
          ...issueCardData,
          status: statusLabel,
          reason,
          solution,
          color: statusLabel === '暂时忽略' ? 'blue' : 'green',
        },
      },
    };
  }
  return {
    toast: {
      type: 'info',
      content: '修改成功',
      i18n: {
        zh_cn: '修改成功',
        en_us: 'card action success',
      },
    },
    card: cardReturn,
  };
};
export default CloseHandler;
