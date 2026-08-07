import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import {
  TenantContext,
  TenantContextType,
} from '@src/common/service/context/tenant.context';
import { SCHEDULE_INFO_KEY } from '@src/common/decorator/schedule-info.decorator';
import { ScheduledTaskRegistryService } from '@src/common/service/schedule-task/schedule-task.registry.service';
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
    protected readonly taskRegistry: ScheduledTaskRegistryService,
  ) {
    this.initContext();
  }
  onModuleInit() {
    this.registerTask();
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
      void this.execute();
    });
    this.schedulerRegistry.addCronJob(this.jobName, job);
    job.start();
  }

  /** 将任务元数据登记到全局注册表，供启动入库与手动触发使用。 */
  protected registerTask() {
    const metadata = Reflect.getMetadata(SCHEDULE_INFO_KEY, this.constructor);
    if (!metadata || !this.jobName) return;
    this.taskRegistry.register({
      taskKey: this.jobName,
      module: metadata.module,
      description: metadata.description,
      cron: this.cron,
      isOpen: this.isOpen,
      instance: this,
    });
  }

  /** 记录一次执行结果，落库失败由注册表内部兜底。 */
  protected async recordRun(
    result: 'success' | 'failed',
    message: string | undefined,
    startTime: number,
  ) {
    await this.taskRegistry.recordRun(this.jobName, {
      result,
      message,
      costMs: Date.now() - startTime,
    });
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
  async handleCron(force: boolean = false) {
    if (!force) return;
    const startTime = Date.now();
    try {
      await this.handle(this.tenantContext.getStore(), force);
      await this.recordRun('success', undefined, startTime);
    } catch (err) {
      await this.recordRun('failed', err.message, startTime);
      this.sendAlertMsg(err.message, err.stack);
    }
  }
  async execute() {
    this.logger.debug(this.constructor.name + ' Called ');

    const runs = this.tenantContextDatas.map((tenantData) =>
      this.tenantContext.run(tenantData, async () => {
        const startTime = Date.now();
        try {
          await this.handle(tenantData, true);
          await this.recordRun('success', undefined, startTime);
        } catch (err) {
          await this.recordRun('failed', err.message, startTime);
          this.sendAlertMsg(err.message, err.stack);
        }
      }),
    );
    await Promise.all(runs);
  }

  protected abstract handle(context: TenantContextType, force: boolean): void;

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
