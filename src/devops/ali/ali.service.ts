import { Injectable } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { AliDevopsDto } from './dto/ali';
import { DevopsApiService } from './common/ali-api/ali-devops.helper';
import { DevopsOptionService } from './common/service/devops-option.service';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import {
  AppWorkflowPublishType,
  executeAppReleaseWorkflowBody,
  executeAppReleaseWorkflowQuery,
  executeAppReleaseWorkflowType,
  PipelineStage,
} from './common/ali-api/interface';
import UserAliyunTable from './common/table/user-token-table';
import { addRetryJob, throttleByParams } from '@src/common/utils/job';
import TipCard from '@src/common/feishu/card/tip-card';
import FeishuUserHelper from '@src/common/feishu/helper/feishu-user-helper';
import { BaseService } from '@src/common/base/base-service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { AliDevopsContext } from './common/service/ali-devops.context';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import dayjs from 'dayjs';
import { NodeConfigService } from '@src/config/node-config.service';
import ProjectPublishWaitingCard from '@src/common/feishu/card/project-publish-waiting';
import FeishuOpenapiHelper from '@src/common/feishu/helper/feishu-openapi-helper';
import { ContactUserType } from '@src/common/feishu/type/contact';
import { uniqueId } from 'lodash';
import { PublishCardInfoType } from './types/devops';

@Injectable()
export class AliService extends BaseService {
  protected readonly redis: Redis;
  protected readonly executeAppReleaseWorkflowThrottle: (
    params: executeAppReleaseWorkflowQuery,
    body: executeAppReleaseWorkflowBody,
  ) => any;

  constructor(
    protected redisService: RedisService,
    protected devopsApiService: DevopsApiService,
    protected devopsOptionService: DevopsOptionService,
    protected feishuMessageHelper: FeishuMessageHelper,
    protected feishuOpenapiHelper: FeishuOpenapiHelper,
    protected userAliyunTable: UserAliyunTable,
    protected devopsContext: AliDevopsContext,
    protected feishuUserHelper: FeishuUserHelper,
    protected readonly logger: LoggerService,
  ) {
    super();
    this.redis = redisService.getClient();

    this.executeAppReleaseWorkflowThrottle = throttleByParams(
      this.devopsApiService.executeAppReleaseWorkflow,
      1000,
      devopsApiService,
    );
  }

  async publish(params: AliDevopsDto) {
    const token = await this.userAliyunTable.getUserAliyunToken(
      params.operator,
    );
    const res = this.devopsContext.run({ token }, async () => {
      const appList = await this.devopsOptionService.checkApp(params);
      const resultList: AppWorkflowPublishType[] = [];
      const queryJobs: Promise<any>[] = [];
      for (const appOption of appList) {
        try {
          const appReleaseWorkflow =
            await this.devopsApiService.queryAppReleaseWorkflow(appOption);
          resultList.push(appReleaseWorkflow);

          const job = this.executeAppReleaseWorkflowThrottle(
            {
              appName: appReleaseWorkflow.appName,
              releaseWorkflowSn: appReleaseWorkflow.releaseWorkflowSn,
              releaseStageSn: appReleaseWorkflow.releaseStageSn,
            },
            {
              ...appReleaseWorkflow.runParams,
              ...appOption.metaData,
              [appReleaseWorkflow.sourcesID]: appOption.branch,
              FLOW_INST_RUNNING_COMMENT: params.content,
            },
          ).then((executeRes) => {
            appReleaseWorkflow.url =
              appReleaseWorkflow.url + executeRes.pipelineRunId;
            appReleaseWorkflow.executionNumber = executeRes.pipelineRunId;
            this.cacheExecuteInfo(appReleaseWorkflow, executeRes);
            appReleaseWorkflow.status = 'INIT';

            return addRetryJob(
              async () =>
                this.checkPipelineDetail(
                  appReleaseWorkflow,
                  params,
                  executeRes.pipelineRunId,
                ),
              60 * 1000,
              20,
            );
          });
          queryJobs.push(job);
        } catch (error) {
          throw new Error(
            `应用：${appOption.appName}发布失败，失败原因：${error.message}`,
          );
        }
      }
      Promise.all(queryJobs)
        .then(() => {
          if (params.env.indexOf('dev') > -1) return;
          this.sendPushWaitingMsg(resultList, params);
        })
        .catch((error) => {
          this.logger.error('查询流水线详情失败，失败原因：' + error.message);
        });
      return resultList;
    });
    return res;
  }

  /**
   * 检查流水线运行情况
   * @param appReleaseWorkflow
   * @param params
   * @param pipelineRunId
   * @returns
   */
  async checkPipelineDetail(
    appReleaseWorkflow: AppWorkflowPublishType,
    params: AliDevopsDto,
    pipelineRunId: number,
  ) {
    const res = await this.devopsApiService.getPipelineDetail({
      appName: appReleaseWorkflow.appName,
      releaseWorkflowSn: appReleaseWorkflow.releaseWorkflowSn,
      releaseStageSn: appReleaseWorkflow.releaseStageSn,
      pipelineRunId: pipelineRunId,
    });
    const stages = res.pipelineRun.stages;

    if (stages[stages.length - 1].stageInfo.status === 'SUCCESS') {
      appReleaseWorkflow.status = 'SUCCESS';
      return true;
    } else {
      const currentStage = stages.find((stage: any) =>
        ['RUNNING', 'WAITING', 'FAIL', 'CANCELED'].includes(
          stage.stageInfo.status,
        ),
      );
      if (!currentStage) {
        sendExceptionToFeishu(
          new Error('当前未知状态：' + currentStage.stageInfo.status),
        );
        console.log('[ currentStage-true ] >', currentStage.stageInfo);
        return true;
      }
      appReleaseWorkflow.status = currentStage.stageInfo?.status;
      if (appReleaseWorkflow.status === 'FAIL') {
        this.sendFailMsg(appReleaseWorkflow, currentStage, params.operator);
        console.log('[ currentStage-true ] >', currentStage.stageInfo);

        return true;
      } else if (appReleaseWorkflow.status === 'WAITING') {
        const name = currentStage.stageInfo.jobs.find((job: any) => {
          return job.status === 'WAITING';
        }).name;
        this.logger.info(
          '当前运行阶段->' + (name || currentStage.stageInfo.name),
        );

        const jobId =
          currentStage.stageInfo.jobs.find((job: any) => {
            return (
              job.name.indexOf('校验') > -1 || job.name.indexOf('卡点') > -1
            );
          })?.id + '';
        appReleaseWorkflow.jobId = jobId;
        this.cancelWorkflow(appReleaseWorkflow, pipelineRunId);
        console.log('[ currentStage-true ] >', currentStage.stageInfo);

        return true;
      } else if (appReleaseWorkflow.status === 'CANCELED') {
        return true;
      } else {
        this.logger.info('当前运行阶段->' + currentStage.stageInfo.name);
        return false;
      }
    }
  }
  async cacheExecuteInfo(
    appReleaseWorkflow: AppWorkflowPublishType,
    executeRes: executeAppReleaseWorkflowType,
  ) {
    const key = RedisKeys.DEVOPS_APP_PUBLISH_CACHE.replace(
      '{workflowTag}',
      appReleaseWorkflow.appName + ':' + appReleaseWorkflow.releaseStageSn,
    );
    executeRes.time = dayjs().valueOf();

    this.redis.sadd(key, JSON.stringify(executeRes));
  }
  async cancelWorkflow(
    appReleaseWorkflow: AppWorkflowPublishType,
    pipelineRunId: number,
  ) {
    const key = RedisKeys.DEVOPS_APP_PUBLISH_CACHE.replace(
      '{workflowTag}',
      appReleaseWorkflow.appName + ':' + appReleaseWorkflow.releaseStageSn,
    );
    const executing = await this.redis.smembers(key);

    const needCancelItem = executing
      .map((item) => JSON.parse(item) as executeAppReleaseWorkflowType)
      .filter((item) => {
        return item.pipelineRunId !== pipelineRunId;
      });
    const current = dayjs().valueOf();
    needCancelItem.forEach(async (item) => {
      if (current - item.time > 1000 * 60 * 10)
        this.devopsApiService.cancelExecuteAppReleaseWorkflow({
          appName: appReleaseWorkflow.appName,
          releaseWorkflowSn: appReleaseWorkflow.releaseWorkflowSn,
          releaseStageSn: appReleaseWorkflow.releaseStageSn,
          executionNumber: item.pipelineRunId,
        });

      this.redis.srem(key, JSON.stringify(item));
    });
  }

  /**
   * 发送卡点通知到群
   * @param appReleaseWorkflowList
   * @param params
   * @returns
   */
  async sendPushWaitingMsg(
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
    const testUserInfo: ContactUserType[] = [];
    for (const unionId of params.testUser) {
      const userInfo = await this.feishuUserHelper.getUserInfo({
        userId: unionId,
        userIdType: 'union_id',
      });
      testUser = testUser + `<at id="${userInfo.user.user_id}"></at>`;
      testUserInfo.push(userInfo.user);
    }

    const status = '测试卡点';
    const runId = uniqueId();
    const content = ProjectPublishWaitingCard.buildCardMsg({
      runId,
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
      btnDisabled: false,
    });
    const publishCardInfo: PublishCardInfoType = {
      appReleaseWorkflowList,
      params,
      testUser,
    };
    const cacheKey = RedisKeys.DEVOPS_APP_PUBLISH_CARD.replace('{id}', runId);
    this.redis.set(cacheKey, JSON.stringify(publishCardInfo));
    this.redis.expire(cacheKey, 60 * 60 * 12);
    testUserInfo.forEach(async (user) => {
      await this.feishuOpenapiHelper.createEphemeralInteractToGroup({
        card: content,
        user_id: user.user_id,
        msg_type: 'interactive',
        chat_id: NodeConfigService.get('AliDevopsFeishuGroupId'),
      });
    });
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
