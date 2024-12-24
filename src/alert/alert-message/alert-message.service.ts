import { Injectable } from '@nestjs/common';
import { SentryAlertDto } from './dto/sentry-alert.dto';
import feishuClient from '@src/common/feishu/client';
import { addRetryJob } from '@src/utils/job';
import { PrismaService } from '@src/prisma.service';

@Injectable()
export class AlertMsgService {
  constructor(private prisma: PrismaService) {}
  /**
   * 发送消息
   * @param alertInfo
   */
  async sendFsAlertMsg(alertInfo: SentryAlertDto) {
    //构建消息内容
    console.log('[ alertInfo ] >', alertInfo);

    // 发送群消息
    const msgInfo = await feishuClient.im.message.create({
      data: {
        receive_id: 'oc_5d491e2bc0287cba81e8cf85765aea8d',
        msg_type: 'text',
        content: '{"text":"test content"}',
      },
      params: {
        receive_id_type: 'chat_id',
      },
    });

    console.log('[msgInfo]:', msgInfo);
    const messageId = msgInfo.data.message_id;
    if (!messageId) {
      throw new Error('消息发送失败，message_id为空');
    }

    //获取飞书用户userid（todo） -> 消息加急
    await this.sendFsAlertMsgToUser(msgInfo, '762a5468');
    //获取leader飞书userid（todo） -> 消息加急
    // await this.sendFsAlertMsgToUser(msgInfo, '762a5468');
    //获取leader的leader飞书userid（todo） -> 消息加急
    // await this.sendFsAlertMsgToUser(msgInfo, '762a5468');
  }
  /**
   * 消息加急
   * @param msgInfo
   * @param userId
   */
  async sendFsAlertMsgToUser(msgInfo: Record<string, any>, userId: string) {
    const messageId = msgInfo.data.message_id;
    // 发送加急消息
    const urgentInfo = await feishuClient.im.message.urgentPhone({
      data: {
        user_id_list: [userId],
      },
      params: {
        user_id_type: 'user_id',
      },
      path: {
        message_id: messageId,
      },
    });
    console.log('[ urgentInfo ] >', urgentInfo);
    //记录已经发出的加急消息信息
    const alertMsgInfo = await this.prisma.alertMessage.create({
      data: {
        messageId,
        userId,
        content: msgInfo.data.body?.content || '',
      },
    });
    console.log('[ alertMsgInfo ] >', alertMsgInfo);
    //每1分钟查看消息是否已读
    await addRetryJob(
      async () => {
        return this.checkMsgIsRead(alertMsgInfo.id);
      },
      60 * 1000,
      5,
    );
  }
  /**
   * 是否已读
   * @param id
   * @returns
   */
  async checkMsgIsRead(id: number) {
    // 查询消息是否已读
    const message = await this.prisma.alertMessage.findUnique({
      where: {
        id,
      },
    });
    return !!message.readTime;
  }
}
