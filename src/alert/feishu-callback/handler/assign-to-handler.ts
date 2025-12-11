import { CardCallbackReturnType } from '@src/common/feishu/type/card';
import { CustomCallbackHandleType } from '.';
import { UnresolvedCardData } from '@src/common/feishu/card/error-unresolved-card';

const AssignToHandler: CustomCallbackHandleType = async (
  event,
  handerService,
): Promise<CardCallbackReturnType<UnresolvedCardData>> => {
  const {
    operator: { open_id },
    action: {
      value: { issueId },
      option: assignToUserId,
    },
  } = event;
  const service = await handerService.getServiceByIssueId(issueId);
  service.assignToHandler({
    issueId,
    operator: open_id,
    assignTo: assignToUserId,
  });

  const userInfo = await handerService.feishuUserHelper.getUserInfo({
    userId: assignToUserId,
    userIdType: 'open_id',
  });

  const {
    user: { enterprise_email },
  } = userInfo;

  handerService.sentryService.updateIssue(
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
