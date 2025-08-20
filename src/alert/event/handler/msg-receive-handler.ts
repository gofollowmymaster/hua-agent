import { CustomEventHandleType } from '.';

const MsgReadHandler: CustomEventHandleType<'im.message.receive_v1'> = async (
  event,
  service,
) => {
  const {
    sender,
    message: { chat_type, content: msgContent, message_type },
  } = event;
  if (message_type !== 'text') return;
  const { text: content } = JSON.parse(msgContent);
  if (content.startsWith('issue:') || parseInt(content) > 1) {
    if (chat_type !== 'p2p') return;

    const issueId = content.replace('issue:', '');
    service.pushIssueCardToUser(issueId, sender.sender_id?.open_id);
  }

  return 'ok';
};

export default MsgReadHandler;
