import { Injectable } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { AliDevopsDto } from './dto/ali';
import { DevopsApiService } from './common/ali-api/ali-devops.helper';
import { DevopsOptionService } from './common/service/devops-option.service';
import ProjectPublishCard from '@src/common/feishu/card/project-publish';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { AppWorkflowPublishType } from './common/ali-api/interface';
import UserAliyunTable from './common/table/user-token-table';
import { addRetryJob } from '@utils/job';
import { AppWorkflowType } from './types/devops';
import TipCard from '@src/common/feishu/card/tip-card';
import { filter } from 'rxjs';
import { NodeConfigService } from '@src/common/service/node-config-service/node-config.service';

@Injectable()
export class AliService {
  protected readonly redis: Redis;

  constructor(
    protected redisService: RedisService,
    protected devopsApiService: DevopsApiService,
    protected devopsOptionService: DevopsOptionService,
    protected feishuMessageHelper: FeishuMessageHelper,
    protected userAliyunTable: UserAliyunTable,
  ) {
    this.redis = redisService.getClient();
  }

  async publish(params: AliDevopsDto): Promise<any> {
    const appList = await this.devopsOptionService.checkApp(params);
    const token = await this.userAliyunTable.getUserAliyunToken(
      params.operator,
    );

    this.devopsApiService.setAliyunToken(token);

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

        const job = addRetryJob(
          async () =>
            this.getPipelineDetail(
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
      Promise.all(queryJobs).then(() => {
        this.sendPushResultMsg(resultList, params);
      });
    }

    return resultList;
  }
  isTestAudit(stageInfo: any) {
    return stageInfo.name === '人工卡点' || stageInfo.name.includes('测试');
  }
  async getPipelineDetail(
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
    const stages = res.pipelineRun.stages;
    if (stages[stages.length - 1].stageInfo.status === 'SUCCESS') {
      appReleaseWorkflow.runResult = 'SUCCESS';
      return true;
    } else {
      const currentStage = stages.find((stage: any) =>
        ['RUNNING', 'WAITING', 'FAIL'].includes(stage.stageInfo.status),
      );
      if (!currentStage) {
        return true;
      }
      if (currentStage.stageInfo?.status === 'FAIL') {
        appReleaseWorkflow.runResult = 'FAIL';
        console.log(
          `应用${appReleaseWorkflow.appName}-${appReleaseWorkflow.workflowName}在运行阶段->${currentStage.stageInfo.name} 执行失败`,
        );
        this.sendFailMsg(appReleaseWorkflow, params.operator);
        return true;
      } else if (currentStage.stageInfo?.status === 'WAITING') {
        appReleaseWorkflow.runResult = 'WAITING';
        const name = currentStage.jobs.find((job: any) => {
          return job.status === 'WAITING';
        }).name;
        console.log('当前运行阶段->' + (name || currentStage.stageInfo.name));
        return true;
      } else {
        appReleaseWorkflow.runResult = 'RUNNING';
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
      appReleaseWorkflowList.filter((item) => item.runResult !== 'FAIL')
        .length === 0
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
          status: item.runResult,
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
  sendFailMsg(appReleaseWorkflow: AppWorkflowPublishType, operator: string) {
    const content = TipCard.buildCardMsg({
      title: '应用发布失败通知',
      bgColor: 'red',
      content: `应用:${appReleaseWorkflow.appName}运行失败！请及时处理！[${appReleaseWorkflow.appName}-${appReleaseWorkflow.workflowName}](${appReleaseWorkflow.url})`,
    });
    this.feishuMessageHelper.createInteractToUser(
      content,
      operator,
      'union_id',
    );
  }
}
