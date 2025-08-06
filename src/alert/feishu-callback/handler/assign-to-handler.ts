import { CustomCallbackHandleType } from '.';

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

  return {
    toast: {
      type: 'info',
      content: '指派成功',
      i18n: {
        zh_cn: '指派成功',
        en_us: 'card action success',
      },
    },
  };
};
export default AssignToHandler;
