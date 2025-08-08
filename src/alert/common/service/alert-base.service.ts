import { Injectable } from '@nestjs/common';
import { addRetryJob } from '@src/utils/job';
import { PrismaService } from '@src/prisma.service';
import {
  // buildAtUserMsg,
  isNeedSendAlertMsg,
} from '../utils';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';

import FeishuApiAlertTable from '../table/api-alert-table';
import FeishuFrontendAlertTable from '../table/frontend-alert-table';
import FeishuFrontendAlertIssueTable from '../table/frontend-alert-issue-table';
import FeishuApiAlertIssueTable from '../table/api-alert-issue-table';
import { BaseService } from '@src/common/base/BaseService';
import { RedisService } from '@src/common/service/redis/redis.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import {
  AlertEvent,
  AssignEvent,
  CloseIssueEvent,
  Environment,
  ModifyStatusEvent,
  PageModuleName,
} from '../type/alert';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import Redis from 'ioredis';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import FeishuUserHelper from '@src/common/feishu/hepler/feishu-user-helper';
import {
  issueStatusMap,
  UnresolvedCardData,
} from '@src/common/feishu/card/error-unresolve-card';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { firstValueFrom } from 'rxjs';
import * as lark from '@larksuiteoapi/node-sdk';
import { HttpService } from '@nestjs/axios';

@Injectable()
export abstract class AlertBaseService extends BaseService {
  protected readonly redis: Redis;
  protected prisma: PrismaService;
  protected readonly logger: LoggerService;
  protected readonly config: ConfigService;
  protected readonly messageHelper: FeishuMessageHelper;
  protected readonly feishuBusinessLineTable: FeishuBusinessLineTable;
  protected readonly redisService: RedisService;
  protected readonly feishuUserHelper: FeishuUserHelper;
  protected readonly httpService: HttpService;

  constructor(redisService) {
    super();
    this.redis = redisService.getClient();
  }

  /**
   * 飞书消息发送
   * @param alertInfo
   */
  async sendFeishuMsg(alertInfo: AlertEvent, message: string) {
    //获取飞书用户userid（todo）群Id -> 消息加急
    const { groupId: feishuGroupId } = await this.getGroupAndUserByProject(
      alertInfo.pageModuleName,
      alertInfo.environment,
    );

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
    const { userId: feishuUserId } = await this.getGroupAndUserByProject(
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

  async getGroupAndUserByProject(
    pageModuleName: PageModuleName,
    environment: Environment,
  ) {
    // const { pageModuleName, environment } = alertInfo;
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
    console.log('[ projectName ] >', projectName, userId);
    return {
      userId,
      groupId,
    };
  }

  async checkIssueInCache(issueId: string) {
    const issueInfo = await this.redis.hgetall(
      RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace('{issueId}', issueId),
    );

    if (!issueInfo.issueId) {
      //跨天问题
      throw new Error(`Issue:${issueId}已失效`);
    }
    return issueInfo;
  }

  async updateIssueCardDataInCache(
    issueId: string,
    issueInfo: Record<string, any>,
  ) {
    const cardDataStr = await this.redis.hget(
      RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace('{issueId}', issueId),
      'cardData',
    );
    const cardData = JSON.parse(cardDataStr) as UnresolvedCardData;
    await this.redis.hset(
      RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace('{issueId}', issueId),
      { cardData: JSON.stringify({ ...cardData, ...issueInfo }) },
    );
  }

  async updateByCard(message_id: string, data) {
    const client = ClientFactory.create(FeishuApp.AlertClient);
    const appId = client.client.appId;
    const appSecret = client.client.appSecret;
    const res = await client.client.auth.v3.appAccessToken.internal(
      {
        data: {
          app_id: appId,
          app_secret: appSecret,
        },
      },
      lark.withTenantToken(''),
    );
    let app_access_token;

    if (res && 'app_access_token' in res) {
      app_access_token = res.app_access_token;
      // 使用 app_access_token
    } else {
      throw new Error('Failed to get app_access_token');
    }
    console.log('[ app_access_token ] >', app_access_token);
    const resData = await firstValueFrom(
      this.httpService.patch(
        'https://open.feishu.cn/open-apis/im/v1/messages/' + message_id,
        data,
        {
          headers: { Authorization: `Bearer ${app_access_token}` },
        },
      ),
    );
    console.log('[ resData ] >', resData);
  }
}
