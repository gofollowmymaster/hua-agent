import { Injectable } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { DevopsApiService } from './common/ali-api/ali-devops.helper';
import ProjectPublishCard from '@src/common/feishu/card/project-publish';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import UserAliyunTable from './common/table/user-token-table';
import FeishuUserHelper from '@src/common/feishu/helper/feishu-user-helper';
import { LoggerService } from '@src/common/service/logger/logger.service';
import FeishuOpenapiHelper from '@src/common/feishu/helper/feishu-openapi-helper';
import { AliDevopsContext } from './common/service/ali-devops.context';
import { BaseDevopsService } from './common/service/base-devops.service';
import ProjectPublishWaitingCard from '@src/common/feishu/card/project-publish-waiting';
import {
  AppWorkflowPublishType,
  PipelineStageType,
} from './common/ali-api/interface';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { PublishCardInfoType } from './types/devops';

@Injectable()
export class PublishCallbackService extends BaseDevopsService {
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
    super(redisService);
  }
  concurrentTask(list, handle) {
    const tasks = [];
    for (const item of list) {
      tasks.push(handle(item));
    }
    return Promise.all(tasks);
  }
  async passPublish(runId: string, operator: string) {
    const cardInfo = await this.checkPublishInCache(runId);

    const token = await this.userAliyunTable.getUserAliyunToken(operator);
    return this.devopsContext.run({ token }, async () => {
      const task = async (appReleaseWorkflow) => {
        if (appReleaseWorkflow.status === 'SUCCESS') {
          return;
        }
        try {
          const res =
            await this.devopsApiService.passExecuteAppReleaseWorkflow(
              appReleaseWorkflow,
            );

          appReleaseWorkflow.status = res.success
            ? 'SUCCESS'
            : appReleaseWorkflow.status;
        } catch (error) {
          console.log('[ passExecuteAppReleaseWorkflow error ] >', error);
          this.sendFailMsg(appReleaseWorkflow, {
            stageName: '测试卡点-通过',
            operator,
            title: '测试卡点通过失败',
          });
        }
        if (appReleaseWorkflow.status === 'SUCCESS') {
          return;
        }
        appReleaseWorkflow.status =
          await this.checkPipelineRunStatus(appReleaseWorkflow);
      };

      await this.concurrentTask(cardInfo.appReleaseWorkflowList, task);
      this.setPublishInCache(runId, cardInfo);

      return this.batchHandleResponse(cardInfo, '已通过测试卡点', runId);
    });
  }
  private batchHandleResponse(
    cardInfo: PublishCardInfoType,
    status: string,
    runId: string,
  ) {
    const card = {
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
      status,
      testUser: cardInfo.testUser,
    };
    if (
      cardInfo.appReleaseWorkflowList.some((item) =>
        ['WAITING', 'RUNNING'].includes(item.status),
      )
    ) {
      return {
        card: ProjectPublishWaitingCard.buildCardMsg({
          ...card,
          btnDisabled: false,
          runId,
          status: '测试卡点',
        }),
        msg: '处理中，请稍后',
      };
    }
    let msg = '处理成功';
    if (
      cardInfo.appReleaseWorkflowList.some((item) =>
        ['FAIL', 'CANCELED'].includes(item.status),
      )
    ) {
      msg = '处理成功，但部分流水线运行失败或取消，请点击查看详情';
    }
    return {
      card: ProjectPublishCard.buildCardJsonMsg(card),
      msg,
    };
  }
  async refusePublish(runId: string, operator: string) {
    const cardInfo = await this.checkPublishInCache(runId);

    const token = await this.userAliyunTable.getUserAliyunToken(operator);
    return this.devopsContext.run({ token }, async () => {
      //取消发布
      const task = async (appReleaseWorkflow) => {
        if (appReleaseWorkflow.status === 'CANCELED') {
          return;
        }
        try {
          const res =
            await this.devopsApiService.refuseExecuteAppReleaseWorkflow(
              appReleaseWorkflow,
            );
          appReleaseWorkflow.status = res.success
            ? 'CANCELED'
            : appReleaseWorkflow.status;
        } catch (error) {
          console.log('[ refuseExecuteAppReleaseWorkflow error ] >', error);

          this.sendFailMsg(appReleaseWorkflow, {
            stageName: '测试卡点-拒绝',
            operator,
            title: '测试卡点拒绝失败',
          });
        }
        if (appReleaseWorkflow.status === 'SUCCESS') {
          return;
        }
        appReleaseWorkflow.status =
          await this.checkPipelineRunStatus(appReleaseWorkflow);
      };
      await this.concurrentTask(cardInfo.appReleaseWorkflowList, task);
      this.setPublishInCache(runId, cardInfo);

      return this.batchHandleResponse(cardInfo, '测试拒绝，发布已取消', runId);
    });
  }

  /**
   * 检查流水线运行情况
   * @param appReleaseWorkflow
   * @param params
   * @param pipelineRunId
   * @returns
   */
  async checkPipelineRunStatus(
    appReleaseWorkflow: AppWorkflowPublishType,
  ): Promise<PipelineStageType> {
    const res = await this.devopsApiService.getPipelineDetail({
      appName: appReleaseWorkflow.appName,
      releaseWorkflowSn: appReleaseWorkflow.releaseWorkflowSn,
      releaseStageSn: appReleaseWorkflow.releaseStageSn,
      pipelineRunId: appReleaseWorkflow.executionNumber,
    });
    const stages = res.pipelineRun.stages;

    if (stages[stages.length - 1].stageInfo.status === 'SUCCESS') {
      appReleaseWorkflow.status = 'SUCCESS';
      return 'SUCCESS';
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
        return currentStage.stageInfo.status;
      }
      appReleaseWorkflow.status = currentStage.stageInfo?.status;
      if (appReleaseWorkflow.status === 'WAITING') {
        const name = currentStage.stageInfo.jobs.find((job: any) => {
          return job.status === 'WAITING';
        }).name;
        this.logger.info(
          '当前运行阶段->' + (name || currentStage.stageInfo.name),
        );

        return 'WAITING';
      } else {
        this.logger.info('当前运行阶段->' + currentStage.stageInfo.name);
        return appReleaseWorkflow.status;
      }
    }
  }
}
