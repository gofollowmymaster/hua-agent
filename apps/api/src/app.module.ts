import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RobotModule } from './robot/robot.module';
import configuration from './config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ConfigModule } from '@nestjs/config';

import { DemoPluginModule } from './demo-plugin/demo-plugin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AiModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { AlertModule } from './alert/alert.module';
import { FdCopilotModule } from './fd-copilot/fd-copilot.module';
import { AgentModule } from './agent/agent.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { DiscardMiddleware } from './common/middleware/discard.middleware';
import { DevopsModule } from './devops/devops.module';
import { GlobalServiceModule } from './common/service/service.module';
import { GlobalExceptionHandlerModule } from './common/filter/global-exception-handler/global-exception.module';
import { GuardModule } from './common/guard/guard.module';
import { ManageModule } from './manage/manage.module';
import { DocModule } from './doc/doc.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { GlobalAdminModule } from './global-admin/global-admin.module';
import { GLOBAL_ADMIN_TENANT_MIDDLEWARE_EXCLUSIONS } from './global-admin/global-admin.constants';

const modulesAll = [
  ManageModule,
  RobotModule,
  AiModule,
  AgentModule,
  AdminModule,
  DocModule,
  DocModule,
  DemoPluginModule,
  AlertModule,
  FdCopilotModule,
  DevopsModule,
  GlobalAdminModule,
];

@Module({
  imports: [
    GlobalServiceModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => configuration],
    }),

    // 静态资源服务
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'public'),
        serveRoot: '/public',
      },
      {
        rootPath: join(__dirname, '..', 'mockServer'),
      },
    ),
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
    GuardModule,
    ...modulesAll,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 你可以指定特定的路由
    consumer
      .apply(TenantMiddleware)
      .exclude(...GLOBAL_ADMIN_TENANT_MIDDLEWARE_EXCLUSIONS)
      .forRoutes('*'); // Global Admin 无租户，其余请求维持现有租户上下文
    consumer.apply(DiscardMiddleware).forRoutes('*'); // 你可以指定特定的路由
  }

  constructor() {}
}
