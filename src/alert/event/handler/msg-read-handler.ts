import { CustomEventHandleType } from '.';

const MsgReadHandler: CustomEventHandleType<
  'im.message.message_read_v1'
> = async (event, service) => {
  const { reader, message_id_list } = event;
  console.log('reader:', reader);
  console.log('message_id_list:', message_id_list);
  const messageId = message_id_list[0];
  const PrismaService = service.prisma;
  await PrismaService.alertMessage.update({
    where: {
      messageId,
    },
    data: {
      readTime: new Date(),
    },
  });
  return 'ok';
};

export default MsgReadHandler;
