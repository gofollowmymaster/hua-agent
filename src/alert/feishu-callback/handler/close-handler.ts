import { CustomCallbackHandleType } from '.';
import ErrorUnresolvedCard, {
  IssueStatus,
  issueStatusMap,
} from '@src/common/feishu/card/error-unresolve-card';
import ErrorResolvedCard from '@src/common/feishu/card/error-resolved-card';
import { ModifyStatusEvent } from '@src/alert/common/type/alert';
import ErrorClosedCard from '@src/common/feishu/card/error-closed-card';

const CloseHandler: CustomCallbackHandleType = async (event, service) => {
  const {
    operator: { open_id },
    action: {
      value: { issueId },
      form_value: { reason, solution },
    },
  } = event;
  service.closeIssueHandler({
    issueId,
    operator: open_id,
    reason,
    solution,
  });

  const issueInfo = await service.checkIssueInCache(issueId);
  let cardReturn;
  if (issueInfo.cardData) {
    const cardData = JSON.parse(issueInfo.cardData);
    const statusLabel = '已关闭';
    cardReturn = {
      type: 'template',
      data: {
        template_id: ErrorClosedCard.templateId,
        template_version_name: ErrorClosedCard.templateVersion,
        template_variable: {
          ...cardData,
          status: statusLabel,
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
