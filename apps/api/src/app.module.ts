import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration from './config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ConfigModule } from '@nestjs/config';

import { AiModule } from './ai/ai.module';
import { JwtModule } from '@nestjs/jwt';
import { AgentModule } from './agent/agent.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { GlobalServiceModule } from './common/service/service.module';
import { GlobalExceptionHandlerModule } from './common/filter/global-exception-handler/global-exception.module';
import { GuardModule } from './common/guard/guard.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    GlobalServiceModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => configuration],
    }),

    // 静态资源服务
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    DevtoolsModule.register({
      http: ['production', 'prod'].includes(process.env.NODE_ENV),
      port: 3001,
    }),
    JwtModule.register({
      global: true,
      secret: configuration['jwtSecret'],
    }),
    GlobalExceptionHandlerModule,
    GuardModule,
    AuthModule,
    AiModule,
    AgentModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
