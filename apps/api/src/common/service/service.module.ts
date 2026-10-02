import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './redis/redis.provider';
import { RedisService } from './redis/redis.service';
import { LoggerService } from './logger/logger.service';
import { TenantContext } from './context/tenant.context';
import { RagPrismaService } from './rag-prisma/rag-prisma.service';
@Global()
@Module({
  providers: [
    RedisProvider,
    RedisService,
    LoggerService,
    TenantContext,
    RagPrismaService,
  ],
  exports: [
    RedisProvider,
    RedisService,
    LoggerService,
    TenantContext,
    RagPrismaService,
  ],
})
export class GlobalServiceModule {}
