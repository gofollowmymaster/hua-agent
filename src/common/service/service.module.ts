import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './redis/redis.provider';
import { RedisService } from './redis/redis.service';
import { LoggerService } from './logger/logger.service';
import { TenantContext } from './context/tenant.context';
import { PrismaService } from './prisma/prisma.service';
import WikiFixedTokenService from './fixed-user-token/wiki-fixed-user-token';
import { DelayedExecutor } from './delay-executor';
@Global()
@Module({
  providers: [
    RedisProvider,
    RedisService,
    LoggerService,
    TenantContext,
    PrismaService,
    WikiFixedTokenService,
    DelayedExecutor,
  ],
  exports: [
    RedisProvider,
    RedisService,
    LoggerService,
    TenantContext,
    PrismaService,
    WikiFixedTokenService,
    DelayedExecutor,
  ],
})
export class GlobalServiceModule {}
