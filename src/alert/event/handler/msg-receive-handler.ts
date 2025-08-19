import { CustomEventHandleType } from '.';

const MsgReadHandler: CustomEventHandleType<'im.message.receive_v1'> = async (
  event,
  service,
) => {
  const { sender, message } = event;

  if (message.message_type !== 'text') return;
  const { text: content } = JSON.parse(message.content);
  if (content.startsWith('issue:') || parseInt(content) > 1) {
    const issueId = content.replace('issue:', '');
    service.pushIssueCardToUser(issueId, sender.sender_id?.open_id);
  }

  return 'ok';
};

export default MsgReadHandler;
