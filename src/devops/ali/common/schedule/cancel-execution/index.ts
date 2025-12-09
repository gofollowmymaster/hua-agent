import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import FeishuClient from '@src/common/feishu/clients/client';

// import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { DevopsApiService } from '../../ali-api/ali-devops.helper';
import { DevopsOptionService } from '../../service/devops-option.service';

@Injectable()
export default class CancelExecutionServer {
  private readonly redis: Redis;
  private readonly client: FeishuClient;
  private readonly logger = new Logger(CancelExecutionServer.name);
  constructor(
    protected readonly redisService: RedisService,
    protected readonly devopsApiService: DevopsApiService,
    protected readonly devopsOptionService: DevopsOptionService,
  ) {
    this.redis = redisService.getClient();
  }

  @Cron('0 0 0 * * *')
  async handleCron(force = false) {
    if (!force && process.env.NODE_ENV !== 'production') return;
    const options = this.devopsOptionService.getOptionExcludDev();
    for (const env in options) {
      const apps = options[env];
      for (const appOption of apps) {
        //查询流水线信息
        const { appName, releaseWorkflowSn, releaseStageSn } =
          await this.devopsApiService.quaryAppReleaseWorkflow({
            appName: appOption.appName,
            workflowName: appOption.workflowName,
          });
        // 查询等待中的执行研发阶段
        this.listWaitingReleaseWorkflow({
          appName,
          releaseWorkflowSn,
          releaseStageSn,
        });
        //取消执行
        // this.devopsApiService.ListAppReleaseStageRuns();
      }
    }
    return;
  }
  async listWaitingReleaseWorkflow({
    appName,
    releaseWorkflowSn,
    releaseStageSn,
  }: Record<string, string>) {
    const runs = await this.devopsApiService.listAppReleaseStageRuns({
      appName,
      releaseWorkflowSn,
      releaseStageSn,
    });
    console.log('[ runs ] >', runs);
  }
}
