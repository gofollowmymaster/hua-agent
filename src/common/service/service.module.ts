import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './redis/redis.provider';
import { RedisService } from './redis/redis.service';
import { LoggerService } from './logger/logger.service';
import { TenantContext } from './context/tenant.context';
import { PrismaService } from './prisma/prisma.service';
@Global()
@Module({
  providers: [
    RedisProvider,
    RedisService,
    LoggerService,
    TenantContext,
    PrismaService,
  ],
  exports: [
    RedisProvider,
    RedisService,
    LoggerService,
    TenantContext,
    PrismaService,
  ],
})
export class GlobalServiceModule {}
