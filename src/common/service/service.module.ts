import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './redis/redis.provider';
import { RedisService } from './redis/redis.service';
import { LoggerService } from './logger/logger.service';
import { TenantContext } from './context/tenant.context';
@Global()
@Module({
  providers: [RedisProvider, RedisService, LoggerService, TenantContext],
  exports: [RedisProvider, RedisService, LoggerService, TenantContext],
})
export class GlobalServiceModule {}
