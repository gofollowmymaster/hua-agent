import { EventHandles } from '@larksuiteoapi/node-sdk';
// import { PrismaService } from '@src/prisma.service';

 const    MsgReactionHandler: EventHandles['im.message.reaction.created_v1'] = async(event) =>{
  const { reaction_type, user_id } = event;
  console.log('reaction_type:', reaction_type);
  console.log('user_id:', user_id);

  //   await PrismaService.alertMessage.update({
  //     where: {
  //       messageId,
  //     },
  //     data: {
  //       readTime: new Date(),
  //     },
  //   });
  return 'ok';
}

export default  MsgReadHandler
