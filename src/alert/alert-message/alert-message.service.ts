import { Injectable } from '@nestjs/common';
import { SentryAlertDto } from './dto/sentry-alert.dto';
import feishuClient from '@src/alert/common/client';
import { addRetryJob } from '@src/utils/job';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import getSendInfoByProject from './app-user-map';
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
    const { userId: feishuUserId, groupId: feishuGroupId } =
      getSendInfoByProject(alertInfo.project);

    // 发送群消息
    const groupMsgInfo = await feishuClient.im.message.create({
      data: {
        receive_id: feishuGroupId,
        msg_type: 'interactive',
        content,
      },
      params: {
        receive_id_type: 'chat_id',
      },
    });
    this.logger.debug(groupMsgInfo);

    const messageId = groupMsgInfo.data.message_id;
    if (!messageId) {
      this.logger.error(groupMsgInfo);
      throw new Error('消息发送失败，message_id为空');
    }

    if (alertInfo.level !== 'fatal') {
      return;
    }

    let res = await this.sendFsAlertMsgToUser(
      groupMsgInfo,
      feishuUserId || '13aabc6b',
    );
    //获取leader飞书userid（todo） -> 消息加急
    !res && (res = await this.sendFsAlertMsgToUser(groupMsgInfo, '13aabc6b'));
    //获取leader的leader飞书userid（todo） -> 消息加急
    // !res && (res = await this.sendFsAlertMsgToUser(msgInfo, '13aabc6b'));

    // await this.sendFsAlertMsgToUser(msgInfo, '762a5468');
  }
  /**
   * 消息加急
   * @param msgInfo
   * @param userId
   */
  async sendFsAlertMsgToUser(msgInfo: Record<string, any>, userId: string) {
    const fMessageId = msgInfo.data.message_id;
    // 发送加急消息
    const urgentInfo = await feishuClient.im.message.urgentPhone({
      data: {
        user_id_list: [userId],
      },
      params: {
        user_id_type: 'user_id',
      },
      path: {
        message_id: fMessageId,
      },
    });
    this.logger.info(urgentInfo);

    //记录已经发出的加急消息信息
    const alertMsgInfo = await this.prisma.alertMessage.create({
      data: {
        fMessageId,
        content: msgInfo.data.body?.content || '',
        userAlerted: {
          create: [
            {
              fUserId: userId,
            },
          ],
        },
      },
    });
    this.logger.info(alertMsgInfo);

    //每1分钟查看消息是否已读
    return await addRetryJob(
      async () => {
        return this.checkMsgIsRead(alertMsgInfo.fMessageId, userId);
      },
      60 * 1000,
      5,
    );
  }
  /**
   * 是否已读
   * @param fMessageId
   * @returns
   */
  async checkMsgIsRead(fMessageId: string, fUserId: string) {
    // 查询消息是否已读
    const message = await this.prisma.alertMessage.findUnique({
      where: {
        fMessageId,
        userAlerted: {
          some: {
            fUserId: fUserId,
          },
        },
      },
      select: {
        userAlerted: true,
        // reactionTime: true,
      },
    });
    return !!message.userAlerted[0].reactionTime;
  }
}
