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
import { CacheModule } from '@nestjs/cache-manager';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ConfigModule } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';

import { WikiModule } from './wiki/wiki.module';
import { DemoPluginModule } from './demo-plugin/demo-plugin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AiModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { AlertModule } from './alert/alert.module';
import { RedisModule } from './common/service/redis/redis.module';
import { GlobalExceptionHandlerModule } from './common/service/global-exception-hander/global-exception.module';
import { FdCopilotModule } from './fd-copilot/fd-copilot.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { ContextModule } from './common/service/context/context.module';
import { DiscardMiddleware } from './common/middleware/discard.middleware';
import { NodeConfigModule } from './common/service/node-config-service/config.module';
import { DevopsModule } from './devops/devops.module';
// import { BaseTableModule } from './common/table/base-table.module';

const ModuleInUsed = process.env.MODULE_USED;
const modulesAll = [
  SubappModule,
  VersionModule,
  VerifyModule,
  RobotModule,
  MockServerModule,
  AiModule,
  AdminModule,
  WikiModule,
  DemoPluginModule,
  AlertModule,
  FdCopilotModule,
  DevopsModule,
];

const modules = ModuleInUsed
  ? modulesAll.filter((item) => ModuleInUsed.includes(item.name))
  : modulesAll;
@Module({
  imports: [
    ContextModule,

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
    NodeConfigModule,
    RedisModule,
    ScheduleModule.forRoot(),
    GlobalExceptionHandlerModule,
    LoggerModule,
    ...modules,
  ],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 你可以指定特定的路由
    consumer.apply(DiscardMiddleware).forRoutes('*'); // 你可以指定特定的路由
    consumer.apply(TenantMiddleware).forRoutes('*');
  }

  constructor() {}
}
