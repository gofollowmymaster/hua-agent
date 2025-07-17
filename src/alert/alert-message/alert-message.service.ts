import { Injectable } from '@nestjs/common';
import { SentryAlertDto } from './dto/sentry-alert.dto';
// import feishuClient from '@src/common/feishu-robot/alert-client';
import { addRetryJob } from '@src/utils/job';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { getSubAppInfo } from './app-user-map';
import {
  // buildAtUserMsg,
  buildAlertMsg,
  isNeedSendAlertMsg,
} from './utils';
import { ConfigService } from '@nestjs/config';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { SentryRawDto } from './dto/sentry-raw.dto';
import SentryApiAlertAdapter from './adapter/sentry-alert-adapter';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import FeishuApiAlertTable from './table/api-alert-table';
import FeishuFrontendAlertTable from './table/frontend-alert-table';
import FeishuBusinessLineTable from './table/business-line-table';
@Injectable()
export class AlertMsgService {
  // private messageHelper;
  private sentryApiAlertAdapter: SentryApiAlertAdapter;
  private ignoreCodeList = ['401', '10002'];
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly messageHelper: FeishuMessageHelper,
    private readonly feishuApiTable: FeishuApiAlertTable,
    private readonly feishuFrontendTable: FeishuFrontendAlertTable,
    private readonly feishuBusinessLineTable: FeishuBusinessLineTable,
  ) {}

  /**
   * 飞书消息发送
   * @param alertInfo
   */
  async sendFeishuMsg(alertInfo: SentryAlertDto) {
    //获取飞书用户userid（todo）群Id -> 消息加急
    const { userId: feishuUserId, groupId: feishuGroupId } =
      this.getGroupAndUserByProject(alertInfo);

    //构建消息内容
    const content = buildAlertMsg({ ...alertInfo }, feishuUserId);
    // 发送群消息

    const groupMsgInfo = await this.messageHelper.createInteractToGroup(
      content,
      feishuGroupId,
    );
    return groupMsgInfo;
  }

  /**
   * 发送消息
   * @param alertInfo
   */
  async sendFsAlertMsg(alertInfo: SentryAlertDto) {
    const groupMsgInfo = await this.sendFeishuMsg(alertInfo);
    // this.logger.error(JSON.stringify(groupMsgInfo));

    const messageId = groupMsgInfo.message_id;

    if (!messageId) {
      this.logger.error(JSON.stringify(groupMsgInfo));
      throw new Error('消息发送失败，message_id为空');
    }

    if (alertInfo.level !== 'fatal') {
      return;
    }

    if (!isNeedSendAlertMsg(alertInfo.timeStamp)) {
      this.logger.info(alertInfo.timeStamp + '当前时间不需要加急通知');
      return;
    }
    const { userId: feishuUserId } = this.getGroupAndUserByProject(alertInfo);
    //不加await 使接口不需要等待加急消息发送
    this.messageAlert(groupMsgInfo, feishuUserId);
  }
  /**
   * 加急消息
   * @param groupMsgInfo
   * @param feishuUserId
   */
  async messageAlert(groupMsgInfo: Record<string, any>, feishuUserId: string) {
    let res = await this.sendFsAlertMsgToUser(groupMsgInfo, feishuUserId);
    //获取leader飞书userid（todo） -> 消息加急
    !res && (res = await this.sendFsAlertMsgToUser(groupMsgInfo, '13aabc6b'));
    //获取leader的leader飞书userid（todo） -> 消息加急
    // !res && (res = await this.sendFsAlertMsgToUser(msgInfo, '13aabc6b'));

    // await this.sendFsAlertMsgToUser(msgInfo, '762a5468');
  }
  /**
   * 消息加急单个用户
   * @param msgInfo
   * @param userId
   */
  async sendFsAlertMsgToUser(msgInfo: Record<string, any>, userId: string) {
    const fMessageId = msgInfo.data.message_id;
    // 发送加急消息
    const urgentInfo = await this.messageHelper.urgentPhone(
      [userId],
      fMessageId,
    );
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

  async getGroupAndUserByProject(alertInfo: SentryAlertDto) {
    const { project, environment } = alertInfo;
    if (environment == 'dev' || environment == 'development') {
      return {
        groupId: this.config.getOrThrow('DefaultAlertFeishuGroupId'),
        userId: this.config.getOrThrow('DefaultAlertFeishuUserId'),
      };
    }

    if (environment == 'uat' || environment == 'test') {
      // uat、test 环境使用的飞书群组
      return {
        groupId: 'oc_b69c0e3bf64478075363125e4fd32507',
        userId: this.config.getOrThrow('DefaultAlertFeishuUserId'),
      };
    }

    /**
     * 解码并处理有空格的情况
     */
    const projectName = decodeURIComponent(project).trim();
    return await this.feishuBusinessLineTable.search({
      conjunction: 'and',
      conditions: [
        {
          field_name: '默认项目',
          operator: 'contains',
          value: [projectName],
        },
      ],
    });
  }

  /**
   * sentry webhook处理
   * @param alertInfo
   */
  async sentryAlertHook(alertInfo: SentryRawDto) {
    const isApiAlert = alertInfo.culprit?.includes('请求错误');
    try {
      this.sentryApiAlertAdapter = new SentryApiAlertAdapter(alertInfo);

      if (isApiAlert) {
        const record = this.sentryApiAlertAdapter.toApiAlertTableData();
        // console.log('[ record ] >', record);
        // 异步记录到多维表格
        await this.feishuApiTable.create(record);

        if (this.ignoreCodeList.includes(record['业务状态码'])) {
          return;
        }
      } else {
        // 异步记录到多维表格
        const record = this.sentryApiAlertAdapter.toFrontendAlertTableData();
        // console.log('[ record ] >', '----------');

        await this.feishuFrontendTable.create(record);
      }
    } catch (err) {
      console.log('[ ------------catch---------- ] >');

      sendExceptionToFeishu(err, this.config);
    }

    const msgData = this.sentryApiAlertAdapter.toFeishuMessageData();
    // 异步发送飞书消息
    this.sendFsAlertMsg(msgData);
  }

  async loadFeishuAplusBussnessList() {
    const list = await this.feishuBusinessLineTable.list();

    return list;
  }
}
