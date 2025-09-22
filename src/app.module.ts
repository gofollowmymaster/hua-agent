import { Module, MiddlewareConsumer, Inject } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { SubappModule } from './subapp/subapp.module';
import { VersionModule } from './version/version.module';
import { VerifyModule } from './verify/verify.module';
import { RobotModule } from './robot/robot.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { MockServerModule } from './mock-server/mock-server.module';
import { LoggerModule } from './common/service/logger/logger.module';
import configuration from './config';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ConfigModule } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { createKeyv } from '@keyv/redis';

import { WikiModule } from './wiki/wiki.module';
import { DemoPluginModule } from './demo-plugin/demo-plugin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulTaskeModule } from './common/schedule-task/schedule-task.module';
import { AiModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { AlertModule } from './alert/alert.module';
import { RedisModule } from './common/service/redis/redis.module';
import { GlobalExceptionHandlerModule } from './common/service/global-exception-hander/global-exception.module';
// import { BaseTableModule } from './common/table/base-table.module';

// const envFilePath = [
//   '.env',
//   `.env.${process.env.NODE_ENV}`,
//   `.env.${process.env.NODE_ENV}.local`,
// ];
@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: envFilePath,
      isGlobal: true,
      load: [() => configuration],
    }),

    CacheModule.register({
      isGlobal: true,
      stores: [
        createKeyv({
          socket: {
            host: configuration['DB_REDIS_HOST'],
            port: configuration['DB_REDIS_PORT'],
          },
          database: configuration['DB_REDIS_DB'], //目标库,
          password: configuration['DB_REDIS_PASSWORD'],
        }),
      ],
    }),
    // 静态资源服务
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'mockServer'),
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    JwtModule.register({
      global: true,
      secret: configuration['jwtSecret'],
    }),
    RedisModule,
    // BaseTableModule,
    GlobalExceptionHandlerModule,
    SubappModule,
    VersionModule,
    VerifyModule,
    RobotModule,
    MockServerModule,
    LoggerModule,
    AiModule,
    AdminModule,
    WikiModule,
    DemoPluginModule,
    ScheduleModule.forRoot(),
    SchedulTaskeModule,
    AlertModule,
  ],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 你可以指定特定的路由
  }

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
}
