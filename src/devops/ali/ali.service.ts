import { Injectable } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { AliDevopsDto } from './dto/ali';
import { DevopsApiService } from './common/ali-api/ali-devops.helper';
import { DevopsOptionService } from './common/service/devops-option.service';
import ProjectPublishCard from '@src/common/feishu/card/project-publish';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import {
  AppWorkflowPublishType,
  PipelineStage,
} from './common/ali-api/interface';
import UserAliyunTable from './common/table/user-token-table';
import { addRetryJob } from '@utils/job';
import TipCard from '@src/common/feishu/card/tip-card';
import { NodeConfigService } from '@src/common/service/node-config-service/node-config.service';
import { AliDevopsContext } from './common/service/ali-devops.context';

@Injectable()
export class AliService {
  protected readonly redis: Redis;

  constructor(
    protected redisService: RedisService,
    protected devopsApiService: DevopsApiService,
    protected devopsOptionService: DevopsOptionService,
    protected feishuMessageHelper: FeishuMessageHelper,
    protected userAliyunTable: UserAliyunTable,
    protected devopsContext: AliDevopsContext,
  ) {
    this.redis = redisService.getClient();
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
            await this.devopsApiService.quaryAppReleaseWorkflow(appOption);
          const executeRes =
            await this.devopsApiService.executeAppReleaseWorkflow(
              {
                appName: appReleaseWorkflow.appName,
                releaseWorkflowSn: appReleaseWorkflow.releaseWorkflowSn,
                releaseStageSn: appReleaseWorkflow.releaseStageSn,
              },
              {
                ...appReleaseWorkflow.runParams,
                ...appOption.metaData,
                [appReleaseWorkflow.sourcesID]: appOption.branch,
              },
            );
          appReleaseWorkflow.status = 'INIT';
          const job = addRetryJob(
            async () =>
              this.checkPipelineDetail(
                appReleaseWorkflow,
                params,
                executeRes.pipelineRunId,
              ),
            60 * 1000,
            20,
          );
          resultList.push(appReleaseWorkflow);
          queryJobs.push(job);
        } catch (error) {
          throw new Error(
            `应用：${appOption.appName}发布失败，失败原因：${error.message}`,
          );
        }
      }
      Promise.all(queryJobs)
        .then(() => {
          this.sendPushResultMsg(resultList, params);
        })
        .catch((error) => {
          console.error(
            '查询流水线详情失败，失败原因：' + error.message,
            error,
          );
        });
      return resultList;
    });
    return res;
  }

  async checkPipelineDetail(
    appReleaseWorkflow: AppWorkflowPublishType,
    params: AliDevopsDto,
    pipelineRunId: string,
  ) {
    const res = await this.devopsApiService.getPipelineDetail({
      appName: appReleaseWorkflow.appName,
      releaseWorkflowSn: appReleaseWorkflow.releaseWorkflowSn,
      releaseStageSn: appReleaseWorkflow.releaseStageSn,
      pipelineRunId: pipelineRunId,
    });
    console.log('[ res ] >', JSON.stringify(res.pipelineRun.stages));
    // this.userAliyunTable.
    const stages = res.pipelineRun.stages;
    if (stages[stages.length - 1].stageInfo.status === 'SUCCESS') {
      appReleaseWorkflow.status = 'SUCCESS';
      return true;
    } else {
      const currentStage = stages.find((stage: any) =>
        ['RUNNING', 'WAITING', 'FAIL'].includes(stage.stageInfo.status),
      );
      if (!currentStage) {
        return true;
      }
      if (currentStage.stageInfo?.status === 'FAIL') {
        appReleaseWorkflow.status = 'FAIL';

        this.sendFailMsg(appReleaseWorkflow, currentStage, params.operator);
        return true;
      } else if (currentStage.stageInfo?.status === 'WAITING') {
        appReleaseWorkflow.status = 'WAITING';
        const name = currentStage.stageInfo.jobs.find((job: any) => {
          return job.status === 'WAITING';
        }).name;
        console.log('当前运行阶段->' + (name || currentStage.stageInfo.name));
        return true;
      } else {
        appReleaseWorkflow.status = 'RUNNING';
        console.log('当前运行阶段->' + currentStage.stageInfo.name);
        return false;
      }
    }
  }
  async sendPushResultMsg(
    appReleaseWorkflowList: AppWorkflowPublishType[],
    params: AliDevopsDto,
  ) {
    // 全部失败 不推送消息
    if (
      appReleaseWorkflowList.filter((item) => item.status !== 'FAIL').length ===
      0
    ) {
      return;
    }

    const testUser = params.testUser?.reduce((prev, next) => {
      return prev + ` <at user_id="${next}"></at>`;
    }, '');
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
    console.log(
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
