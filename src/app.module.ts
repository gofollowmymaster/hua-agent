import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RobotModule } from './robot/robot.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import configuration from './config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ConfigModule } from '@nestjs/config';

import { WikiModule } from './wiki/wiki.module';
import { DemoPluginModule } from './demo-plugin/demo-plugin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AiModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { AlertModule } from './alert/alert.module';
import { FdCopilotModule } from './fd-copilot/fd-copilot.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { DiscardMiddleware } from './common/middleware/discard.middleware';
import { DevopsModule } from './devops/devops.module';
import { GlobalServiceModule } from './common/service/service.module';
import { GlobalExceptionHandlerModule } from './common/filter/global-exception-handler/global-exception.module';

const modulesAll = [
  RobotModule,
  AiModule,
  AdminModule,
  WikiModule,
  DemoPluginModule,
  AlertModule,
  FdCopilotModule,
  DevopsModule,
];

@Module({
  imports: [
    GlobalServiceModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => configuration],
    }),

    // 静态资源服务
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'mockServer'),
    }),
    DevtoolsModule.register({
      http: ['production', 'prod'].includes(process.env.NODE_ENV),
      port: 3001,
    }),
    JwtModule.register({
      global: true,
      secret: configuration['jwtSecret'],
    }),
    ScheduleModule.forRoot(),
    GlobalExceptionHandlerModule,
    ...modulesAll,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*'); //服务商上下文中间件放在最前面，后续任何消息发送才可行
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 你可以指定特定的路由
    consumer.apply(DiscardMiddleware).forRoutes('*'); // 你可以指定特定的路由
  }

  constructor() {}
}
