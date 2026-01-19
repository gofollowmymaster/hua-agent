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
  protected readonly isOpen: boolean = true;

  protected readonly logger = new Logger(this.constructor.name);
  protected tenantContextDatas: TenantContextType[] = [];

  constructor(
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    this.initContext();
  }
  onModuleInit() {
    if (!this.isOpen) return;
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
    job.start();
  }
  protected initContext() {
    const tenantConfig = globalConfig['tenantConfig'];

    for (const tenant in tenantConfig) {
      this.tenantContextDatas.push({
        tenantCode: tenant as TenantCode,
      });
    }
  }

  /**
   * 供外部主动触发
   * @param force
   */
  handleCron(force: boolean = false) {
    if (!force) return;

    this.handle(this.tenantContext.getStore());
  }
  async execute() {
    this.logger.debug(this.constructor.name + ' Called ');

    for (const tenantData of this.tenantContextDatas) {
      this.tenantContext.run(tenantData, async () => {
        try {
          await this.handle(tenantData);
        } catch (err) {
          this.sendAlertMsg(err.message, err.stack);
        }
      });
    }
  }

  protected abstract handle(context: TenantContextType): void;

  protected sendAlertMsg(
    message: string,
    content: string,
    title = '定时任务报警',
  ) {
    sendCommonCardToFeishu({
      title: title,
      project: process.env.PROJECT_NAME,
      color: 'red',
      message: message,
      content: content,
    });
  }
}
