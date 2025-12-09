import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import {
  TenantContext,
  TenantContextType,
} from '@src/common/service/context/tenant.context';
import globalConfig from '@src/config';
import { TenantCode } from '@src/config/tenant';

@Injectable()
export default abstract class BaseSchedule implements OnModuleInit {
  protected readonly cron: string = '';
  protected readonly jobName: string;

  protected readonly logger = new Logger(this.constructor.name);
  protected readonly tenantContextDatas: TenantContextType[] = [];

  constructor(
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    this.initContext();
  }
  onModuleInit() {
    if (!this.cron) {
      throw Error('定时任务没有配置执行周期');
    }
    if (this.schedulerRegistry.doesExist('cron', this.jobName)) {
      return;
    }
    if (this.tenantContextDatas.length < 1) {
      this.logger.warn(
        '定时任务没有配置任何上下文，请确保你不依赖任何服务商上下文',
      );
    }
    const job = new CronJob(this.cron, () => {
      this.execute();
    });
    this.schedulerRegistry.addCronJob(this.jobName, job);
  }
  protected initContext() {
    const tenantConfig = globalConfig['tenantConfig'];

    for (const tenant in tenantConfig) {
      this.tenantContextDatas.push({
        tenantCode: tenant as TenantCode,
      });
    }
  }
  protected handleCron(force: boolean = false) {
    if (!force && ['development', 'dev'].includes(process.env.NODE_ENV)) return;
    this.execute();
  }
  async execute() {
    this.logger.debug(this.constructor.name + ' Called ');
    this.tenantContextDatas.forEach((tenantData) => {
      this.tenantContext.run(tenantData, async () => {
        this.handle(tenantData);
      });
    });
  }

  protected abstract handle(context: any);

  protected sendAlertMsg(message: string, content: string) {
    sendCommonCardToFeishu({
      title: '定时任务报警',
      project: process.env.PROJECT_NAME,
      color: 'red',
      message: message,
      content: content,
    });
  }
}
