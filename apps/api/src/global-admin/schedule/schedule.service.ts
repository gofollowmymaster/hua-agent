import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/rag-client';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import { ScheduledTaskRegistryService } from '@src/common/service/schedule-task/schedule-task.registry.service';
import {
  GlobalAdminScheduleDetailDto,
  GlobalAdminScheduleLogDto,
  GlobalAdminScheduleLogPageDto,
  GlobalAdminScheduleLogQueryDto,
  GlobalAdminScheduleQueryDto,
  GlobalAdminScheduleSummaryDto,
} from './dto/schedule.dto';

/** 提供无租户的定时任务管理用例：列表、详情、手动触发与执行日志。 */
@Injectable()
export class GlobalAdminScheduleService {
  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly registry: ScheduledTaskRegistryService,
  ) {}

  /** 按关键字与状态过滤返回全部定时任务。 */
  async list(
    query: GlobalAdminScheduleQueryDto,
  ): Promise<GlobalAdminScheduleSummaryDto[]> {
    const where: Prisma.ScheduledTaskWhereInput = {};
    if (query.keyword) {
      where.OR = [
        { module: { contains: query.keyword } },
        { description: { contains: query.keyword } },
      ];
    }
    if (query.status) {
      where.status = query.status;
    }
    const tasks = await this.ragPrisma.scheduledTask.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    return tasks.map((task) => this.toSummary(task));
  }

  /** 返回指定任务的详情。 */
  async get(taskKey: string): Promise<GlobalAdminScheduleDetailDto> {
    const task = await this.findTask(taskKey);
    return this.toDetail(task);
  }

  /** 手动触发任务执行并返回刷新后的详情。 */
  async trigger(taskKey: string): Promise<GlobalAdminScheduleDetailDto> {
    const task = await this.findTask(taskKey);
    const entry = this.registry.getEntry(taskKey);
    if (!entry) {
      throw new NotFoundException(`定时任务未注册: ${taskKey}`);
    }
    await entry.instance.execute();
    const refreshed = await this.ragPrisma.scheduledTask.findUnique({
      where: { taskKey },
    });
    return this.toDetail(refreshed ?? task);
  }

  /** 分页返回指定任务的执行日志。 */
  async listLogs(
    taskKey: string,
    query: GlobalAdminScheduleLogQueryDto,
  ): Promise<GlobalAdminScheduleLogPageDto> {
    const task = await this.findTask(taskKey);
    const where: Prisma.ScheduledTaskLogWhereInput = { taskId: task.id };
    if (query.result) {
      where.result = query.result;
    }
    const [list, total] = await Promise.all([
      this.ragPrisma.scheduledTaskLog.findMany({
        where,
        orderBy: { executeTime: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.ragPrisma.scheduledTaskLog.count({ where }),
    ]);
    return {
      list: list.map((log) => this.toLog(log)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  /** 按 taskKey 查询任务，不存在时抛出 404。 */
  private async findTask(taskKey: string) {
    const task = await this.ragPrisma.scheduledTask.findUnique({
      where: { taskKey },
    });
    if (!task) {
      throw new NotFoundException(`定时任务不存在: ${taskKey}`);
    }
    return task;
  }

  /** 转换为列表响应结构。 */
  private toSummary(task: {
    taskKey: string;
    module: string;
    description: string;
    cron: string;
    status: string;
    lastRunTime: Date | null;
    lastRunResult: string | null;
  }): GlobalAdminScheduleSummaryDto {
    return {
      taskKey: task.taskKey,
      module: task.module,
      description: task.description,
      cron: task.cron,
      status: task.status as GlobalAdminScheduleSummaryDto['status'],
      lastRunTime: task.lastRunTime,
      lastRunResult:
        task.lastRunResult as GlobalAdminScheduleSummaryDto['lastRunResult'],
    };
  }

  /** 转换为详情响应结构。 */
  private toDetail(task: {
    taskKey: string;
    module: string;
    description: string;
    cron: string;
    status: string;
    lastRunTime: Date | null;
    lastRunResult: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): GlobalAdminScheduleDetailDto {
    return {
      ...this.toSummary(task),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  /** 转换为日志响应结构，BigInt 主键序列化为字符串。 */
  private toLog(log: {
    id: bigint;
    executeTime: Date;
    result: string;
    message: string | null;
    costMs: number | null;
  }): GlobalAdminScheduleLogDto {
    return {
      id: String(log.id),
      executeTime: log.executeTime,
      result: log.result as GlobalAdminScheduleLogDto['result'],
      message: log.message,
      costMs: log.costMs,
    };
  }
}
