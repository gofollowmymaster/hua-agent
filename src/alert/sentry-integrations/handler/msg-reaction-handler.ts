import { CustomEventHandleType } from '.';

const MsgReactionHandler: CustomEventHandleType<
  'im.message.reaction.created_v1'
> = async (event, service) => {
  const { message_id: messageId, reaction_type, user_id } = event;
  console.log('reaction_type:', reaction_type);

  const PrismaService = service.prisma;
  await PrismaService.alertMessageUser.updateMany({
    where: {
      // message: {},
      messageId,
      fUserId: user_id.user_id,
    },
    data: {
      reactionTime: new Date(),
    },
  });
  return 'ok';
};

export default MsgReactionHandler;
