import { Injectable } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { AliDevopsDto } from './dto/ali';
import { DevopsApiService } from './common/ali-api/ali-devops.helper';
import { DevopsOptionService } from './common/service/devops-option.service';
import ProjectPublishCard from '@src/common/feishu/card/project-publish';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { AppWorkflowPublishType } from './common/ali-api/interface';

@Injectable()
export class AliService {
  protected readonly redis: Redis;

  constructor(
    protected redisService: RedisService,
    protected devopsApiService: DevopsApiService,
    protected devopsOptionService: DevopsOptionService,
    protected feishuMessageHelper: FeishuMessageHelper,
  ) {
    this.redis = redisService.getClient();
  }

  async publish(params: AliDevopsDto): Promise<any> {
    const appList = await this.devopsOptionService.checkApp(params);
    const resultList: AppWorkflowPublishType[] = [];
    for (const appOption of appList) {
      try {
        const appReleaseWorkflow =
          await this.devopsApiService.quaryAppReleaseWorkflow(appOption);

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
        resultList.push(appReleaseWorkflow);
      } catch (error) {
        throw new Error(
          `应用：${appOption}发布失败，失败原因：${error.message}`,
        );
      }
      setTimeout(() => {
        this.sendPushMsg(resultList, params);
      }, 4000);
    }

    return resultList;
  }
  async sendPushMsg(
    appReleaseWorkflow: AppWorkflowPublishType[],
    params: AliDevopsDto,
  ) {
    // issueCardData = this.alertFeishuAdapter.toAplusAlertCardeData();
    //       issueCardData.linkUrl = eventRecord.recordUrl;
    const content = ProjectPublishCard.buildCardMsg({
      content: params.content,
      links: appReleaseWorkflow.map((item) => {
        return {
          project: item.appName,
          link: item.url,
        };
      }),
      operator: params.operator,
      workflowEnv: params.env,
      status: '',
      testUser: [],
    });
    this.feishuMessageHelper.createInteractToGroup(
      content,
      'oc_48ff8eeb73c84269ba80e96c7dfd7879',
    );
  }
}
