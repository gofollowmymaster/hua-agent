import { MsgReadEvent } from '../dto/feishu-event.dto';
// import { PrismaService } from '@src/prisma.service';

export default async function MsgReadHandler(event: MsgReadEvent) {
  const { reader, message_id_list } = event;
  console.log('reader:', reader);
  console.log('message_id_list:', message_id_list);

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
