import { Injectable } from '@nestjs/common';
import { addRetryJob } from '@src/utils/job';
import { PrismaService } from '@src/prisma.service';
import {
  // buildAtUserMsg,
  isNeedSendAlertMsg,
} from '../utils';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';

import AlertFeishuAdapter from '../adapter/alert-feishu-adapter';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import FeishuApiAlertTable from '../table/api-alert-table';
import FeishuFrontendAlertTable from '../table/frontend-alert-table';
import FeishuFrontendAlertIssueTable from '../table/frontend-alert-issue-table';
import FeishuApiAlertIssueTable from '../table/api-alert-issue-table';
import { BaseService } from '@src/common/base/BaseService';
import { RedisService } from '@src/common/service/redis/redis.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { AlertEvent, ErrorEndpoint } from '../type/alert';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';

@Injectable()
export class AlertBaseService extends BaseService {
  // private messageHelper;
  protected prisma: PrismaService;
  protected readonly logger: LoggerService;
  protected readonly config: ConfigService;
  protected readonly messageHelper: FeishuMessageHelper;
  protected readonly feishuApiTable: FeishuApiAlertTable;
  protected readonly feishuApiIssueTable: FeishuApiAlertIssueTable;
  protected readonly feishuFrontendTable: FeishuFrontendAlertTable;
  protected readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable;
  protected readonly feishuBusinessLineTable: FeishuBusinessLineTable;
  protected readonly redisService: RedisService;
  protected readonly alertFeishuAdapter: AlertFeishuAdapter;
  protected ignoreCodeList = ['401', '10002'];
  constructor() {
    super();
  }

  /**
   * 飞书消息发送
   * @param alertInfo
   */
  async sendFeishuMsg(alertInfo: AlertEvent, message: string) {
    //获取飞书用户userid（todo）群Id -> 消息加急
    const { groupId: feishuGroupId } =
      await this.getGroupAndUserByProject(alertInfo);

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

    if (alertInfo.level !== 'fatal') {
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
  async messageAlert(groupMsgInfo: Record<string, any>, alertInfo: AlertEvent) {
    const urgentType = isNeedSendAlertMsg(alertInfo.timestamp)
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

  async getGroupAndUserByProject(alertInfo: AlertEvent) {
    const { pageModuleName, environment } = alertInfo;
    if (environment == 'dev' || environment == 'development') {
      return {
        groupId: this.config.getOrThrow('FeishuMsgDebugGroupId'),
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
    const projectName = decodeURIComponent(pageModuleName).trim();
    const { frontendAlertGroupId: groupId, frontendLeaderId: userId } =
      await this.feishuBusinessLineTable.getBusinessLineBySubapp(projectName);

    return {
      userId,
      groupId,
    };
  }
  async writeToTable(errorEvent: AlertEvent) {
    switch (errorEvent.errorEndpoint) {
      case ErrorEndpoint.Server:
        await this.writeToBackEndTable(errorEvent);

        break;
      case ErrorEndpoint.Page:
        await this.writeToFrontendTable(errorEvent);
        break;
      default:
        sendExceptionToFeishu(new Error('未知错误端点类型'));
        break;
    }
  }

  async writeToFrontendTable(alertInfo: AlertEvent) {
    try {
      // 异步记录到多维表格
      const record = await this.alertFeishuAdapter.toFrontendAlertTableData();

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
          await this.alertFeishuAdapter.toFrontendAlertIssueTableData();
        await this.feishuFrontendIssueTable.create(issue);
      } else {
        const record = issueRes.items[0];
        const { record_id: recordId, fields } = record;
        await this.feishuFrontendIssueTable.update(recordId, {
          错误次数: (fields['错误次数'] as number) + 1,
        });
      }
    } catch (err) {
      sendExceptionToFeishu(err);
    }
  }
  async writeToBackEndTable(alertInfo: AlertEvent) {
    // const isApiAlert = alertInfo.culprit?.includes('请求错误');
    try {
      const record = await this.alertFeishuAdapter.toApiAlertTableData();
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
        const issue = await this.alertFeishuAdapter.toApiAlertIssueTableData();
        await this.feishuApiIssueTable.create(issue);
      } else {
        const record = issueRes.items[0];
        const { record_id: recordId, fields } = record;
        await this.feishuApiIssueTable.update(recordId, {
          错误次数: (fields['错误次数'] as number) + 1,
        });
      }
    } catch (err) {
      sendExceptionToFeishu(err);
    }
  }
}
