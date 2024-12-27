import MsgReadHandler from './msg-read-handler';

const EventHandler = {
  'im.message.message_read_v1': MsgReadHandler,
};
export default EventHandler;
