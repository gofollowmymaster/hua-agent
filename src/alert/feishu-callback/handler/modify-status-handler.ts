import { CustomCallbackHandleType } from '.';
import ErrorUnresolvedCard, {
  IssueStatus,
  issueStatusMap,
} from '@src/common/feishu/card/error-unresolve-card';
import ErrorResolvedCard from '@src/common/feishu/card/error-resolved-card';
import { ModifyStatusEvent } from '@src/alert/common/type/alert';

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
  const issueInfo = await service.checkIssueInCache(issueId);
  console.log('[ issueInfo ] >', issueInfo);
  service.modifyStatusHandler({
    issueId,
    operator: open_id,
    issueStatus,
  } as ModifyStatusEvent);

  if (issueInfo.cardData) {
    const cardData = JSON.parse(issueInfo.cardData);
    const statusLabel = issueStatusMap[issueStatus];
    let cardReturn = {
      type: 'template',
      data: {
        template_id: ErrorUnresolvedCard.templateId,
        template_version_name: ErrorUnresolvedCard.templateVersion,
        template_variable: {
          ...cardData,
          color: ErrorUnresolvedCard.getColor(statusLabel),
          status: statusLabel,
          statusOptions: ErrorUnresolvedCard.statusOptions(statusLabel),
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
            status: issueStatusMap[issueStatus],
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
