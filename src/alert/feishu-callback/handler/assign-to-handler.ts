import { RedisKeys } from '@src/common/const/redis-key.enum';
import { CustomCallbackHandleType } from '.';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import ErrorUnresolvedCard from '@src/common/feishu/card/error-unresolve-card';
import { ErrorEndpoint } from '@src/alert/common/type/alert';

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
  const issueInfo = await service.redis.hgetall(
    RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace('{issueId}', issueId),
  );

  if (!issueInfo.issueId) {
    //跨天问题
    return;
  }

  if (issueInfo.messageId) {
    service.messageHelper.replyInThread(
      JSON.stringify({
        zh_cn: {
          content: [
            [
              {
                tag: 'at',
                user_id: open_id,
              },
              {
                tag: 'text',
                text: `将问题指派给`,
              },
              {
                tag: 'at',
                user_id: assignToUserId,
              },
            ],
          ],
        },
      }),
      issueInfo.messageId,
      FeishuMsgType.Post,
    );
  }
  const userInfo = await service.feishuUserHelper.getUserInfo({
    userId: assignToUserId,
    userIdType: 'open_id',
  });

  const {
    user: { user_id, name, enterprise_email },
  } = userInfo;
  console.log('[ user_id ] >', assignToUserId, open_id, userInfo);
  console.log('[ user_id ] >', user_id);
  service.updateTable(
    issueInfo.issueId,
    issueInfo.errorEndpoint as ErrorEndpoint,
    {
      负责人: [{ id: assignToUserId }],
    },
  );

  service.sentryService.updateIssue(
    {
      assignedTo: enterprise_email,
    },
    issueId,
  );

  if (issueInfo.cardData) {
    const cardData = JSON.parse(issueInfo.cardData);

    return {
      toast: {
        type: 'info',
        content: '指派成功',
        i18n: {
          zh_cn: '指派成功',
          en_us: 'card action success',
        },
      },
      card: {
        type: 'template',
        data: {
          template_id: ErrorUnresolvedCard.templateId,
          template_version_name: ErrorUnresolvedCard.templateVersion,
          template_variable: {
            ...cardData,
            userId: assignToUserId,
            userName: name,
          },
        },
      },
    };
  }
};
export default AssignToHandler;
