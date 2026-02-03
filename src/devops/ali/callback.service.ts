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
  async passPublish(runId: string, operator: string) {
    const cardInfo = await this.checkPublishInCache(runId);
    if (!cardInfo) {
      throw new Error('发布信息已过期，如需通过请通过链接逐一处理');
    }
    const token = await this.userAliyunTable.getUserAliyunToken(operator);
    console.log('[ token ] >', token);
    return this.devopsContext.run({ token }, async () => {
      //通过
      for (const appReleaseWorkflow of cardInfo.appReleaseWorkflowList) {
        if (appReleaseWorkflow.status === 'SUCCESS') {
          continue;
        }
        try {
          const res =
            await this.devopsApiService.passExecuteAppReleaseWorkflow(
              appReleaseWorkflow,
            );
          console.log('[ res ] >', res);
          appReleaseWorkflow.status = 'SUCCESS';
        } catch (error) {
          this.sendFailMsg(appReleaseWorkflow, '测试卡点-通过', operator);
        }
      }
      this.setPublishInCache(runId, cardInfo);
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
        status: '已通过测试卡点',
        testUser: cardInfo.testUser,
      };
      if (
        cardInfo.appReleaseWorkflowList.some(
          (item) => item.status !== 'SUCCESS',
        )
      ) {
        return ProjectPublishWaitingCard.buildCardMsg({
          ...card,
          btnDisabled: false,
          runId,
          status: '测试卡点',
        });
      }
      return ProjectPublishCard.buildCardJsonMsg(card);
    });
  }
  async refusePublish(runId: string, operator: string) {
    const cardInfo = await this.checkPublishInCache(runId);
    if (!cardInfo) {
      throw new Error('发布信息已过期，如需通过请通过链接逐一处理');
    }
    const token = await this.userAliyunTable.getUserAliyunToken(operator);
    console.log('[ token ] >', token);
    return this.devopsContext.run({ token }, async () => {
      //取消发布
      for (const appReleaseWorkflow of cardInfo.appReleaseWorkflowList) {
        if (appReleaseWorkflow.status === 'CANCELED') {
          continue;
        }
        try {
          const res =
            await this.devopsApiService.refuseExecuteAppReleaseWorkflow(
              appReleaseWorkflow,
            );
          console.log('[ res ] >', res);
          appReleaseWorkflow.status = 'CANCELED';
        } catch (error) {
          this.sendFailMsg(appReleaseWorkflow, '测试卡点-拒绝', operator);
        }
      }
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
        status: '测试拒绝，发布已取消',
        testUser: cardInfo.testUser,
      };
      if (
        cardInfo.appReleaseWorkflowList.some(
          (item) => item.status !== 'CANCELED',
        )
      ) {
        return ProjectPublishWaitingCard.buildCardMsg({
          ...card,
          btnDisabled: false,
          runId,
          status: '测试卡点',
        });
      }

      return ProjectPublishCard.buildCardJsonMsg(card);
    });
  }
}
