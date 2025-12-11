import { AlertEvent, Environment, ErrorLevel } from '../type/alert';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import { NodeConfigService } from '@src/config/node-config.service';
import { isNeedSendAlertMsg } from '../utils';
import { addRetryJob } from '@src/common/utils/job';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { PrismaService } from '@src/prisma.service';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MsgAlertService {
  constructor(
    protected prisma: PrismaService,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly logger: LoggerService,
    protected readonly feishuBusinessLineTable: FeishuBusinessLineTable,
  ) {}

  /**
   * 飞书消息发送
   * @param alertInfo
   */
  private async sendFeishuMsg(alertInfo: AlertEvent, message: string) {
    //获取飞书用户userid（todo）群Id -> 消息加急
    const { groupId: feishuGroupId } = await this.getGroupAndUserByProject(
      alertInfo.pageModuleName,
      alertInfo.environment,
    );
    console.log('[ this.messageHelper ] >', this.messageHelper);
    // 发送群消息
    const groupMsgInfo = await this.messageHelper.createInteractToGroup(
      message,
      feishuGroupId,
    );
    return groupMsgInfo;
  }

  /**
   * 发送消息
   * @param alertInfo
   */
  async sendFsAlertMsg(alertInfo: AlertEvent, message: string) {
    const groupMsgInfo = await this.sendFeishuMsg(alertInfo, message);
    // this.logger.error(JSON.stringify(groupMsgInfo));

    const messageId = groupMsgInfo.message_id;

    if (!messageId) {
      this.logger.error(JSON.stringify(groupMsgInfo));
      throw new Error('消息发送失败，message_id为空');
    }

    if (alertInfo.level !== ErrorLevel.FATAL) {
      return groupMsgInfo;
    }

    //不加await 使接口不需要等待加急消息发送
    this.messageAlert(groupMsgInfo, alertInfo);
    return groupMsgInfo;
  }
  /**
   * 加急消息
   * @param groupMsgInfo
   * @param feishuUserId
   */
  private async messageAlert(
    groupMsgInfo: Record<string, any>,
    alertInfo: AlertEvent,
  ) {
    const urgentType = isNeedSendAlertMsg(alertInfo.timestamp)
      ? 'Phone'
      : 'App';
    const { fUserId: feishuUserId } = await this.getGroupAndUserByProject(
      alertInfo.pageModuleName,
      alertInfo.environment,
    );
    let res = await this.sendFsAlertMsgToUser(
      groupMsgInfo,
      feishuUserId,
      urgentType,
    );
    //获取leader飞书userid（todo） -> 消息加急
    !res &&
      (res = await this.sendFsAlertMsgToUser(
        groupMsgInfo,
        '13aabc6b',
        urgentType,
      ));
    //获取leader的leader飞书userid（todo） -> 消息加急
    // !res && (res = await this.sendFsAlertMsgToUser(msgInfo, '13aabc6b'));

    // await this.sendFsAlertMsgToUser(msgInfo, '762a5468');
  }
  /**
   * 消息加急单个用户
   * @param msgInfo
   * @param userId
   */
  private async sendFsAlertMsgToUser(
    msgInfo: Record<string, any>,
    userId: string,
    urgentType,
  ) {
    const fMessageId = msgInfo.message_id;
    let urgentInfo;
    // 发送加急消息
    if (urgentType === 'App') {
      urgentInfo = await this.messageHelper.urgentApp([userId], fMessageId);
    } else {
      urgentInfo = await this.messageHelper.urgentPhone([userId], fMessageId);
    }

    this.logger.info(urgentInfo);

    //记录已经发出的加急消息信息
    const alertMsgInfo = await this.prisma.alertMessage.create({
      data: {
        fMessageId,
        content: msgInfo.body?.content || '',
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

    this.messageHelper.replyInThread(
      JSON.stringify({
        zh_cn: {
          content: [
            [
              {
                tag: 'md',
                text: `已发送加急消息给<at user_id="${userId}"></at>`,
              },
            ],
          ],
        },
      }),
      fMessageId,
      FeishuMsgType.Post,
    );

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
  private async checkMsgIsRead(fMessageId: string, fUserId: string) {
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

  private async getGroupAndUserByProject(
    pageModuleName: string,
    environment: Environment,
  ) {
    // const { pageModuleName, environment } = alertInfo;
    if (environment == 'dev' || environment == 'development') {
      return {
        groupId: NodeConfigService.getOrThrow('FeishuMsgDebugGroupId'),
        fUserId: NodeConfigService.getOrThrow('DefaultAlertFeishuUserId'),
        bUserId: NodeConfigService.getOrThrow('DefaultAlertFeishuUserId'),
      };
    }

    if (environment == 'uat' || environment == 'test') {
      // uat、test 环境使用的飞书群组
      return {
        groupId: 'oc_b69c0e3bf64478075363125e4fd32507',
        fUserId: NodeConfigService.getOrThrow('DefaultAlertFeishuUserId'),
        bUserId: NodeConfigService.getOrThrow('DefaultAlertFeishuUserId'),
      };
    }

    /**
     * 解码并处理有空格的情况
     */
    const projectName = decodeURIComponent(pageModuleName).trim();
    const {
      frontendAlertGroupId: groupId,
      frontendLeaderId: fUserId,
      backendLeaderId: bUserId,
    } = await this.feishuBusinessLineTable.getBusinessLineBySubapp(projectName);
    return {
      fUserId,
      bUserId,
      groupId,
    };
  }
}
