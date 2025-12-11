import { CustomCallbackHandleType } from '.';
import ErrorUnresolvedCard, {
  IssueStatus,
  IssueStatusEnum,
  UnresolvedCardData,
} from '@src/common/feishu/card/error-unresolved-card';
import ErrorResolvedCard from '@src/common/feishu/card/error-resolved-card';
import { ModifyStatusEvent } from '@src/alert/common/type/alert';
import {
  CardCallbackReturnType,
  CardReturnType,
} from '@src/common/feishu/type/card';

const ModifyStatusHandler: CustomCallbackHandleType = async (
  event,
  handerService,
): Promise<CardCallbackReturnType<UnresolvedCardData>> => {
  const {
    operator: { open_id },
    action: {
      value: { issueId },
      option: issueStatus,
    },
    // token,
    // context: { open_message_id, open_chat_id },
  } = event;
  const service = await handerService.getServiceByIssueId(issueId);

  const issueCardData = await service.checkIssueInCache(issueId);
  service.modifyStatusHandler({
    issueId,
    operator: open_id,
    issueStatus,
  } as ModifyStatusEvent);

  if (issueCardData) {
    const statusLabel = IssueStatusEnum[issueStatus];
    let cardReturn: CardReturnType<UnresolvedCardData> = {
      type: 'template',
      data: {
        template_id: ErrorUnresolvedCard.templateId,
        template_version_name: ErrorUnresolvedCard.templateVersion,
        template_variable: {
          ...issueCardData,
          color: ErrorUnresolvedCard.getColor(statusLabel),
          status: statusLabel,
          statusOptions: ErrorUnresolvedCard.statusOptions(statusLabel),
        },
      },
    };
    if (
      ['resolved', 'ignoreCount100', 'ignoreCount1000'].includes(issueStatus)
    ) {
      //修改sentry

      handerService.sentryService.updateIssue(
        {
          status: issueStatus as IssueStatus,
        },
        issueCardData.issueId,
      );

      cardReturn = {
        type: 'template',
        data: {
          template_id: ErrorResolvedCard.templateId,
          template_version_name: ErrorResolvedCard.templateVersion,
          template_variable: {
            ...issueCardData,
            status: IssueStatusEnum[issueStatus],
            statusOptions: [],
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
