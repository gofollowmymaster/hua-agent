import { RedisKeys } from '@src/common/const/redis-key.enum';
import { CustomCallbackHandleType } from '.';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import ErrorUnresolvedCard, {
  IssueStatus,
  issueStatusMap,
} from '@src/common/feishu/card/error-unresolve-card';
import ErrorResolvedCard from '@src/common/feishu/card/error-resolved-card';

const ModifyStatusHandler: CustomCallbackHandleType = async (
  event,
  service,
) => {
  const {
    operator: { open_id },
    action: {
      value: { issueId },
      option: issueStatus,
    },
    // token,
    // context: { open_message_id, open_chat_id },
  } = event;
  const issueInfo = await service.redis.hgetall(
    RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace('{issueId}', issueId),
  );

  /**
   * 1. 发送回复消息
   * 2. 修改消息界面
   * 3. 修改多为表格
   * 4. 修改sentry
   */

  if (!issueInfo.issueId) {
    //跨天问题
    return;
  }
  console.log('[ issueInfo ] >', issueInfo);

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
                text: `将将问题状态修改为`,
              },
              {
                tag: 'text',
                text: issueStatusMap[issueStatus] || issueStatus,
                style: ['bold'],
              },
            ],
          ],
        },
      }),
      issueInfo.messageId,
      FeishuMsgType.Post,
    );
  }

  // service.updateTable(
  //   issueInfo.issueId,
  //   issueInfo.errorEndpoint as ErrorEndpoint,
  //   {
  //     负责人: [assignToUserId],
  //   },
  // );

  if (issueInfo.cardData) {
    const cardData = JSON.parse(issueInfo.cardData);
    let cardReturn = {
      type: 'template',
      data: {
        template_id: ErrorUnresolvedCard.templateId,
        template_version_name: ErrorUnresolvedCard.templateVersion,
        template_variable: {
          ...cardData,
          status: issueStatus,
        },
      },
    };
    if (
      ['resolved', 'ignoreCount100', 'ignoreCount1000'].includes(
        issueStatus as IssueStatus,
      )
    ) {
      //修改sentry
      service.sentryService.updateIssue(
        {
          status: issueStatus as IssueStatus,
          // assignee: assignToUserId,
        },
        issueInfo.issueId,
      );

      cardReturn = {
        type: 'template',
        data: {
          template_id: ErrorResolvedCard.templateId,
          template_version_name: ErrorResolvedCard.templateVersion,
          template_variable: {
            ...cardData,
            status: issueStatus,
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
  }
};
export default ModifyStatusHandler;
