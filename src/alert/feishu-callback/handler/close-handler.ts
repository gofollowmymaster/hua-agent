import { CustomCallbackHandleType } from '.';

import ErrorClosedCard from '@src/common/feishu/card/error-closed-card';

const CloseHandler: CustomCallbackHandleType = async (event, handerService) => {
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

  const issueInfo = await service.checkIssueInCache(issueId);
  let cardReturn;
  if (issueInfo.cardData) {
    const cardData = JSON.parse(issueInfo.cardData);
    const statusLabel =
      cardData.status === '暂时忽略' ? cardData.status : '已关闭';
    cardReturn = {
      type: 'template',
      data: {
        template_id: ErrorClosedCard.templateId,
        template_version_name: ErrorClosedCard.templateVersion,
        template_variable: {
          ...cardData,
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
