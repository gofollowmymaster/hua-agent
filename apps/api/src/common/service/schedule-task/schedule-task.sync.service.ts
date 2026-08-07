import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import { ScheduledTaskRegistryService } from './schedule-task.registry.service';

/** 应用启动后将注册表中的定时任务元数据同步到数据库，新增任务自动入库。 */
@Injectable()
export class ScheduledTaskSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ScheduledTaskSyncService.name);

  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly registry: ScheduledTaskRegistryService,
  ) {}

  /** 按 taskKey upsert 所有已注册任务；不删除注册表中已不存在的任务。 */
  async onApplicationBootstrap() {
    for (const entry of this.registry.listEntries()) {
      try {
        const status = entry.isOpen ? 'enabled' : 'disabled';
        await this.ragPrisma.scheduledTask.upsert({
          where: { taskKey: entry.taskKey },
          update: {
            module: entry.module,
            description: entry.description,
            cron: entry.cron,
            status,
          },
          create: {
            taskKey: entry.taskKey,
            module: entry.module,
            description: entry.description,
            cron: entry.cron,
            status,
          },
        });
      } catch (error) {
        this.logger.error(`同步定时任务失败: ${entry.taskKey}`, error);
      }
    }
  }
}
