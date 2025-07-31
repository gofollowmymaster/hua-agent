import { CustomCallbackHandleType } from '.';

const MsgReadHandler: CustomCallbackHandleType<
  'im.message.message_read_v1'
> = async (event, service) => {
  const { reader, message_id_list } = event;

  const messageId = message_id_list[0];
  const PrismaService = service.prisma;
  await PrismaService.alertMessageUser.updateMany({
    where: {
      messageId,
      fUserId: reader.reader_id.user_id,
    },
    data: {
      readTime: new Date(),
    },
  });
  return 'ok';
};

export default MsgReadHandler;
