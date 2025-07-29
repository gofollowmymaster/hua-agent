import { Injectable } from '@nestjs/common';
import { ErrorLevel, SentryAlertDto } from './dto/sentry-alert.dto';
// import feishuClient from '@src/common/feishu-robot/alert-client';
import { addRetryJob } from '@src/utils/job';
import { PrismaService } from '@src/prisma.service';
import {
  // buildAtUserMsg,
  buildAlertMsg,
  isNeedSendAlertMsg,
} from './utils';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { SentryEvent } from './dto/sentry-raw.dto';
import SentryApiAlertAdapter from './adapter/sentry-alert-adapter';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import FeishuApiAlertTable from './table/api-alert-table';
import FeishuFrontendAlertTable from './table/frontend-alert-table';
import FeishuBusinessLineTable from '../../common/table/business-line-table';
import FeishuFrontendAlertIssueTable from './table/frontend-alert-issue-table';
import FeishuApiAlertIssueTable from './table/api-alert-issue-table';
import { BaseService } from '@src/common/base/BaseService';
import { RedisService } from '@src/common/service/redis/redis.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AlertMsgService extends BaseService {
  // private messageHelper;
  private sentryApiAlertAdapter: SentryApiAlertAdapter;
  private ignoreCodeList = ['401', '10002'];
  constructor(
    private prisma: PrismaService,
    protected readonly logger: LoggerService,
    protected readonly config: ConfigService,
    private readonly messageHelper: FeishuMessageHelper,
    private readonly feishuApiTable: FeishuApiAlertTable,
    private readonly feishuApiIssueTable: FeishuApiAlertIssueTable,
    private readonly feishuFrontendTable: FeishuFrontendAlertTable,
    private readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable,
    private readonly feishuBusinessLineTable: FeishuBusinessLineTable,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  /**
   * 飞书消息发送
   * @param alertInfo
   */
  async sendFeishuMsg(alertInfo: SentryAlertDto) {
    //获取飞书用户userid（todo）群Id -> 消息加急
    const { userId: feishuUserId, groupId: feishuGroupId } =
      await this.getGroupAndUserByProject(alertInfo);

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

    //不加await 使接口不需要等待加急消息发送
    this.messageAlert(groupMsgInfo, alertInfo);
  }
  /**
   * 加急消息
   * @param groupMsgInfo
   * @param feishuUserId
   */
  async messageAlert(
    groupMsgInfo: Record<string, any>,
    alertInfo: SentryAlertDto,
  ) {
    const urgentType = isNeedSendAlertMsg(alertInfo.timeStamp)
      ? 'Phone'
      : 'App';
    const { userId: feishuUserId } =
      await this.getGroupAndUserByProject(alertInfo);
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
  async sendFsAlertMsgToUser(
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
      console.log(
        '[ this.config.getOrThrow ] >',
        this.config.getOrThrow('DefaultAlertFeishuUserId'),
      );
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
    const res = await this.feishuBusinessLineTable.search({
      conjunction: 'and',
      conditions: [
        {
          field_name: '责任项目',
          operator: 'contains',
          value: [projectName],
        },
      ],
    });

    const userId = res.items[0].fields['前端leader'][0].id;
    const groupId = res.items[0].fields['前端监控群'][0].id;
    return {
      userId,
      groupId,
    };
  }

  async writeToTable(alertInfo: SentryEvent) {
    const isApiAlert = alertInfo.culprit?.includes('请求错误');
    try {
      if (isApiAlert) {
        const record = this.sentryApiAlertAdapter.toApiAlertTableData();
        // 异步记录到多维表格
        await this.feishuApiTable.create(record);

        const issueRes = await this.feishuApiIssueTable.search(
          {
            conjunction: 'and',
            conditions: [
              {
                field_name: 'IssueId',
                operator: 'is',
                value: [alertInfo.issue_id],
              },
            ],
          },
          false,
        );
        if (issueRes.total == 0) {
          const issue = this.sentryApiAlertAdapter.toApiAlertIssueTableData();
          await this.feishuApiIssueTable.create(issue);
        } else {
          const record = issueRes.items[0];
          const { record_id: recordId, fields } = record;
          await this.feishuApiIssueTable.update(recordId, {
            错误次数: (fields['错误次数'] as number) + 1,
          });
        }
        if (this.ignoreCodeList.includes(record['业务状态码'])) {
          return;
        }
      } else {
        // 异步记录到多维表格
        const record = this.sentryApiAlertAdapter.toFrontendAlertTableData();

        this.feishuFrontendTable.create(record);
        const issueRes = await this.feishuFrontendIssueTable.search(
          {
            conjunction: 'and',
            conditions: [
              {
                field_name: 'IssueId',
                operator: 'is',
                value: [alertInfo.issue_id],
              },
            ],
          },
          false,
        );
        if (issueRes.total == 0) {
          const issue =
            this.sentryApiAlertAdapter.toFrontendAlertIssueTableData();
          await this.feishuFrontendIssueTable.create(issue);
        } else {
          const record = issueRes.items[0];
          const { record_id: recordId, fields } = record;
          await this.feishuFrontendIssueTable.update(recordId, {
            错误次数: (fields['错误次数'] as number) + 1,
          });
        }
      }
    } catch (err) {
      sendExceptionToFeishu(err, this.config);
    }
  }

  /**
   * sentry webhook处理
   * @param alertInfo
   */
  async sentryAlertHook(errorEvent: SentryEvent) {
    this.sentryApiAlertAdapter = new SentryApiAlertAdapter(errorEvent);

    this.writeToTable(errorEvent);

    const isLimited = await this.redisService.limiter(
      errorEvent.issue_id,
      1,
      60 * 5,
    ); // 限制每5分钟最多处理一次
    if (isLimited) return;
    const msgData = this.sentryApiAlertAdapter.toFeishuMessageData();

    // 异步发送飞书消息
    this.sendFsAlertMsg(msgData);
  }

  /**
   * 高危报警
   * @param alertInfo
   */
  async fatalErrorAlertMsg(errorEvent: SentryEvent) {
    this.sentryApiAlertAdapter = new SentryApiAlertAdapter(errorEvent);

    const msgData = this.sentryApiAlertAdapter.toFeishuMessageData();
    msgData.level = ErrorLevel.FATAL;
    // 异步发送飞书消息
    this.sendFsAlertMsg(msgData);
  }
}
