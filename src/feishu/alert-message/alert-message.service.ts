import { Injectable } from '@nestjs/common';
import { SentryAlertDto } from './dto/sentry-alert.dto';
import feishuClient from '@src/common/feishu/client';
import { addRetryJob } from '@src/utils/job';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import appUserMap from './app-user-map';
import { buildFeishuTemplateCardMsg } from './utils';
@Injectable()
export class AlertMsgService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 发送消息
   * @param alertInfo
   */
  async sendFsAlertMsg(alertInfo: SentryAlertDto) {
    //构建消息内容
    const content = buildFeishuTemplateCardMsg(alertInfo);
      //获取飞书用户userid（todo）群Id -> 消息加急
      const {userId:feishuUserId,groupId:feishuGroupId} = appUserMap[alertInfo.project];

    // 发送群消息
    const msgInfo = await feishuClient.im.message.create({
      data: {
        receive_id: feishuGroupId,
        msg_type: 'interactive',
        content,
      },
      params: {
        receive_id_type: 'chat_id',
      },
    });

    this.logger.debug(msgInfo);
    const messageId = msgInfo.data.message_id;
    if (!messageId) {
      this.logger.error(msgInfo);
      throw new Error('消息发送失败，message_id为空');
    }

  
    await this.sendFsAlertMsgToUser(msgInfo, feishuUserId || '13aabc6b');
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
    this.logger.info(urgentInfo);

    //记录已经发出的加急消息信息
    const alertMsgInfo = await this.prisma.alertMessage.create({
      data: {
        messageId,
        userId,
        content: msgInfo.data.body?.content || '',
      },
    });
    this.logger.info(alertMsgInfo);

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
  async markAsReaded(messageId: string) {
    await this.prisma.alertMessage.update({
      where: {
        messageId,
      },
      data: {
        readTime: new Date(),
      },
    });
  }
}
