import { Injectable } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import ProjectPublishCard from '@src/common/feishu/card/project-publish';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import TipCard from '@src/common/feishu/card/tip-card';
import FeishuUserHelper from '@src/common/feishu/helper/feishu-user-helper';
import { BaseService } from '@src/common/base/base-service';
import { NodeConfigService } from '@src/config/node-config.service';
import FeishuOpenapiHelper from '@src/common/feishu/helper/feishu-openapi-helper';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { PublishCardInfoType } from '../../types/devops';
import { AliDevopsDto } from '../../dto/ali';
import { AppWorkflowPublishType, PipelineStage } from '../ali-api/interface';
import { set } from 'lodash-es';

@Injectable()
export class BaseDevopsService extends BaseService {
  protected readonly redis: Redis;
  protected feishuMessageHelper: FeishuMessageHelper;
  protected feishuOpenapiHelper: FeishuOpenapiHelper;
  protected feishuUserHelper: FeishuUserHelper;
  constructor(protected redisService: RedisService) {
    super();
    this.redis = redisService.getClient();
  }
  async setPublishInCache(runId: string, cardInfo: PublishCardInfoType) {
    const cacheKey = RedisKeys.DEVOPS_APP_PUBLISH_CARD.replace('{id}', runId);
    this.redis.set(cacheKey, JSON.stringify(cardInfo));
    this.redis.expire(cacheKey, 60 * 60 * 12);
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
    stageName: string,
    operator: string,
  ) {
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

  sendFailMessage(
    appReleaseWorkflow: AppWorkflowPublishType,
    currentStage: PipelineStage,
    operator: string,
  ) {
    let stageName = currentStage.stageInfo.jobs.find((job) => {
      return job.status === 'FAIL';
    })?.name;
    stageName = stageName || currentStage.stageInfo.name;
    this.sendFailMsg(appReleaseWorkflow, stageName, operator);
  }
}
