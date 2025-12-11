import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import FeishuClient from '@src/common/feishu/clients/client';

// import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { DevopsApiService } from '../../ali-api/ali-devops.helper';
import { DevopsOptionService } from '../../service/devops-option.service';
import BaseSchedule from '@src/common/base/base.schedule';
import { TenantContext } from '@src/common/service/context/tenant.context';

@Injectable()
export default class CancelExecutionServer extends BaseSchedule {
  //每30分钟运行一次
  protected readonly cron = '0 0 0 * * *';
  protected readonly jobName = 'Cancel Execute Devops';
  protected readonly isPause = true;

  private readonly redis: Redis;
  private readonly client: FeishuClient;
  constructor(
    protected readonly redisService: RedisService,
    protected readonly devopsApiService: DevopsApiService,
    protected readonly devopsOptionService: DevopsOptionService,
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(tenantContext, schedulerRegistry);
    this.redis = redisService.getClient();
  }

  async handle() {
    const options = this.devopsOptionService.getOptionExcludeDev();
    for (const env in options) {
      const apps = options[env];
      for (const appOption of apps) {
        //查询流水线信息
        const { appName, releaseWorkflowSn, releaseStageSn } =
          await this.devopsApiService.queryAppReleaseWorkflow({
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
