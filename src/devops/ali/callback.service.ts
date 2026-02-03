import { Injectable } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { AliDevopsDto } from './dto/ali';
import { DevopsApiService } from './common/ali-api/ali-devops.helper';
import ProjectPublishCard from '@src/common/feishu/card/project-publish';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import {
  AppWorkflowPublishType,
  PipelineStage,
} from './common/ali-api/interface';
import UserAliyunTable from './common/table/user-token-table';
import TipCard from '@src/common/feishu/card/tip-card';
import FeishuUserHelper from '@src/common/feishu/helper/feishu-user-helper';
import { BaseService } from '@src/common/base/base-service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { NodeConfigService } from '@src/config/node-config.service';
import FeishuOpenapiHelper from '@src/common/feishu/helper/feishu-openapi-helper';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { PublishCardInfoType } from './types/devops';
import { AliDevopsContext } from './common/service/ali-devops.context';
import ProjectPublishWaitingCard from '@src/common/feishu/card/project-publish-waiting';

@Injectable()
export class PublishCallbackService extends BaseService {
  protected readonly redis: Redis;

  constructor(
    protected redisService: RedisService,
    protected devopsApiService: DevopsApiService,
    protected feishuMessageHelper: FeishuMessageHelper,
    protected feishuOpenapiHelper: FeishuOpenapiHelper,
    protected userAliyunTable: UserAliyunTable,
    protected feishuUserHelper: FeishuUserHelper,
    protected devopsContext: AliDevopsContext,
    protected readonly logger: LoggerService,
  ) {
    super();
    this.redis = redisService.getClient();
  }
  async checkPublishInCache(runId: string) {
    const cacheKey = this.redisService.buildCacheKey(
      RedisKeys.DEVOPS_APP_PUBLISH_CARD,
      '{id}',
      runId,
    );
    const cardInfo = await this.redis.get(cacheKey);
    const cardInfoParsed = JSON.parse(cardInfo + '');
    return cardInfoParsed as PublishCardInfoType;
  }
  async passPublish(runId: string, operator: string) {
    const cardInfo = await this.checkPublishInCache(runId);
    if (!cardInfo) {
      throw new Error('发布信息已过期，如需通过请通过链接逐一处理');
    }
    const token = await this.userAliyunTable.getUserAliyunToken(operator);
    console.log('[ token ] >', token);
    this.devopsContext.run({ token }, async () => {
      //通过
      for (const appReleaseWorkflow of cardInfo.appReleaseWorkflowList) {
        await this.devopsApiService.passExecuteAppReleaseWorkflow(
          appReleaseWorkflow,
        );
      }
      //删除消息

      //推送消息
      await this.sendPushResultMsg(
        cardInfo.appReleaseWorkflowList,
        cardInfo.params,
      );
    });
    return ProjectPublishWaitingCard.buildCardMsg({
      runId,
      content: cardInfo.params.content,
      links: cardInfo.appReleaseWorkflowList.map((item) => {
        return {
          project: item.appName,
          link: `[${item.appName}（${item.workflowName}）](${item.url})`,
          status: item.status,
        };
      }),
      operator: {
        id: cardInfo.params.operator,
      },
      workflowEnv: cardInfo.params.env,
      status: '已通过测试，正在发布中',
      btnDisabled: true,
      testUser: cardInfo.testUser,
    });
  }
  async refusePublish(runId: string, operator: string) {
    const cardInfo = await this.checkPublishInCache(runId);
    if (!cardInfo) {
      throw new Error('发布信息已过期，如需通过请通过链接逐一处理');
    }
    const token = await this.userAliyunTable.getUserAliyunToken(operator);
    console.log('[ token ] >', token);
    this.devopsContext.run({ token }, async () => {
      //取消发布
      for (const appReleaseWorkflow of cardInfo.appReleaseWorkflowList) {
        await this.devopsApiService.refuseExecuteAppReleaseWorkflow(
          appReleaseWorkflow,
        );
      }
      //删除消息

      //推送消息
      // this.sendFailMsg(cardInfo.appReleaseWorkflowList, cardInfo.params);
    });
    return ProjectPublishWaitingCard.buildCardMsg({
      runId,
      content: cardInfo.params.content,
      links: cardInfo.appReleaseWorkflowList.map((item) => {
        return {
          project: item.appName,
          link: `[${item.appName}（${item.workflowName}）](${item.url})`,
          status: item.status,
        };
      }),
      operator: {
        id: cardInfo.params.operator,
      },
      workflowEnv: cardInfo.params.env,
      status: '测试拒绝，发布已取消',
      btnDisabled: true,
      testUser: cardInfo.testUser,
    });
  }
  /**
   * 发送运行结果到群
   * @param appReleaseWorkflowList
   * @param params
   * @returns
   */
  async sendPushResultMsg(
    appReleaseWorkflowList: AppWorkflowPublishType[],
    params: AliDevopsDto,
  ) {
    // 全部失败 不推送消息
    if (
      appReleaseWorkflowList.filter(
        (item) => !['FAIL', 'CANCELED'].includes(item.status),
      ).length === 0
    ) {
      return;
    }
    let testUser: string = '';
    for (const unionId of params.testUser) {
      const userInfo = await this.feishuUserHelper.getUserInfo({
        userId: unionId,
        userIdType: 'union_id',
      });
      testUser = testUser + `<at id="${userInfo.user.user_id}"></at>`;
    }

    const status = '';
    const content = ProjectPublishCard.buildCardMsg({
      content: params.content,
      links: appReleaseWorkflowList.map((item) => {
        return {
          project: item.appName,
          link: `[${item.appName}（${item.workflowName}）](${item.url})`,
          status: item.status,
        };
      }),
      operator: {
        id: params.operator,
      },
      workflowEnv: params.env,
      status,
      testUser,
    });
    this.feishuMessageHelper.createInteractToGroup(
      content,
      NodeConfigService.get('AliDevopsFeishuGroupId'),
    );
  }

  sendFailMsg(
    appReleaseWorkflow: AppWorkflowPublishType,
    currentStage: PipelineStage,
    operator: string,
  ) {
    let stageName = currentStage.stageInfo.jobs.find((job) => {
      return job.status === 'FAIL';
    })?.name;
    stageName = stageName || currentStage.stageInfo.name;
    this.logger.info(
      `应用${appReleaseWorkflow.appName}-${appReleaseWorkflow.workflowName}在运行阶段->${stageName} 执行失败`,
    );
    const content = TipCard.buildCardMsg({
      title: '应用发布失败通知',
      bgColor: 'red',
      content: `应用:<text_tag color='blue'>${appReleaseWorkflow.appName}</text_tag>在**${stageName}**阶段运行失败！请及时处理！[${appReleaseWorkflow.appName}-${appReleaseWorkflow.workflowName}](${appReleaseWorkflow.url})`,
    });
    this.feishuMessageHelper.createInteractToUser(
      content,
      operator,
      'union_id',
    );
  }
}
