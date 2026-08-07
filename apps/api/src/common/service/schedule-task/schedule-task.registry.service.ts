import { Injectable, Logger } from '@nestjs/common';
import type BaseSchedule from '@src/common/base/base.schedule';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';

/** 定时任务注册项：由 BaseSchedule 子类在启动时登记。 */
export interface ScheduledTaskEntry {
  taskKey: string;
  module: string;
  description: string;
  cron: string;
  isOpen: boolean;
  instance: BaseSchedule;
}

/** 一次定时任务执行的记录结果。 */
export interface ScheduledTaskRun {
  result: 'success' | 'failed';
  message?: string;
  costMs: number;
}

/** 内存中的定时任务注册表，负责收集任务元数据并落库执行日志。 */
@Injectable()
export class ScheduledTaskRegistryService {
  private readonly logger = new Logger(ScheduledTaskRegistryService.name);
  private readonly tasks = new Map<string, ScheduledTaskEntry>();

  constructor(private readonly ragPrisma: RagPrismaService) {}

  /** 按 taskKey 幂等登记一个定时任务。 */
  register(entry: ScheduledTaskEntry) {
    if (!entry.taskKey) return;
    this.tasks.set(entry.taskKey, entry);
  }

  /** 返回指定 taskKey 的注册项，供手动触发使用。 */
  getEntry(taskKey: string): ScheduledTaskEntry | undefined {
    return this.tasks.get(taskKey);
  }

  /** 返回全部注册项，按 taskKey 排序保证稳定顺序。 */
  listEntries(): ScheduledTaskEntry[] {
    return [...this.tasks.values()].sort((a, b) =>
      a.taskKey.localeCompare(b.taskKey),
    );
  }

  /** 记录一次执行结果并刷新任务上次执行信息；落库失败不影响业务执行。 */
  async recordRun(taskKey: string, run: ScheduledTaskRun) {
    try {
      const task = await this.ragPrisma.scheduledTask.findUnique({
        where: { taskKey },
      });
      if (!task) return;
      const executeTime = new Date();
      await this.ragPrisma.scheduledTaskLog.create({
        data: {
          taskId: task.id,
          executeTime,
          result: run.result,
          message: run.message,
          costMs: run.costMs,
        },
      });
      await this.ragPrisma.scheduledTask.update({
        where: { id: task.id },
        data: { lastRunTime: executeTime, lastRunResult: run.result },
      });
    } catch (error) {
      this.logger.error(`记录定时任务执行日志失败: ${taskKey}`, error);
    }
  }
}
