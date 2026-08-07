import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './redis/redis.provider';
import { RedisService } from './redis/redis.service';
import { LoggerService } from './logger/logger.service';
import { TenantContext } from './context/tenant.context';
import { PrismaService } from './prisma/prisma.service';
import WikiFixedTokenService from './fixed-user-token/wiki-fixed-user-token';
import { RagPrismaService } from './rag-prisma/rag-prisma.service';
import { ScheduledTaskRegistryService } from './schedule-task/schedule-task.registry.service';
import { ScheduledTaskSyncService } from './schedule-task/schedule-task.sync.service';
@Global()
@Module({
  providers: [
    RedisProvider,
    RedisService,
    LoggerService,
    TenantContext,
    PrismaService,
    WikiFixedTokenService,
    RagPrismaService,
    ScheduledTaskRegistryService,
    ScheduledTaskSyncService,
  ],
  exports: [
    RedisProvider,
    RedisService,
    LoggerService,
    TenantContext,
    PrismaService,
    WikiFixedTokenService,
    RagPrismaService,
    ScheduledTaskRegistryService,
    ScheduledTaskSyncService,
  ],
})
export class GlobalServiceModule {}
