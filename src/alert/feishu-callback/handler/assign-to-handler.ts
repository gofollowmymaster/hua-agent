import { CustomCallbackHandleType } from '.';
import ErrorUnresolvedCard from '@src/common/feishu/card/error-unresolve-card';

const AssignToHandler: CustomCallbackHandleType = async (event, service) => {
  const {
    operator: { open_id },
    action: {
      value: { issueId },
      option: assignToUserId,
    },
    // token,
    // context: { open_message_id, open_chat_id },
  } = event;

  service.assignToHandler({
    issueId,
    operator: open_id,
    assignTo: assignToUserId,
  });

  const userInfo = await service.feishuUserHelper.getUserInfo({
    userId: assignToUserId,
    userIdType: 'open_id',
  });

  const {
    user: { user_id, enterprise_email },
  } = userInfo;
  console.log('[ user_id ] >', assignToUserId, open_id, userInfo);
  console.log('[ user_id ] >', user_id);

  service.sentryService.updateIssue(
    {
      assignedTo: enterprise_email,
    },
    issueId,
  );
  // const issueInfo = await service.checkIssueInCache(issueId);
  // if (issueInfo.cardData) {
  // const cardData = JSON.parse(issueInfo.cardData);

  return {
    toast: {
      type: 'info',
      content: '指派成功',
      i18n: {
        zh_cn: '指派成功',
        en_us: 'card action success',
      },
    },
    // card: {
    //   type: 'template',
    //   data: {
    //     template_id: ErrorUnresolvedCard.templateId,
    //     template_version_name: ErrorUnresolvedCard.templateVersion,
    //     template_variable: {
    //       ...cardData,
    //       userId: assignToUserId,
    //       userName: name,
    //     },
    //   },
    // },
    // };
  };
};
export default AssignToHandler;
