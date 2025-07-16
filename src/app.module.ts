import { Module, MiddlewareConsumer, Inject } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { SubappModule } from './subapp/subapp.module';
import { VersionModule } from './version/version.module';
import { VerifyModule } from './verify/verify.module';
import { RobotModule } from './robot/robot.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { MockServerModule } from './mock-server/mock-server.module';
import { AlertMsgModule } from '@src/alert/alert-message/alert-message.module';
import { FeishuEventModule } from '@src/alert/event/event.module';
import { LoggerModule } from './common/service/logger/logger.module';
import configuration from './config';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './aplus/auth/auth.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ConfigModule } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { createKeyv } from '@keyv/redis';

import { WikiModule } from './wiki/wiki.module';
import { DemoPluginModule } from './demo-plugin/demo-plugin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulTaskeModule } from './common/schedule-task/schedule-task.module';
import { AiModule } from './ai/ai.module';
import { JwtModule } from '@nestjs/jwt';

const envFilePath = [
  '.env',
  `.env.${process.env.NODE_ENV}`,
  `.env.${process.env.NODE_ENV}.local`,
];
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePath,
      isGlobal: true,
      load: [() => configuration],
    }),

    CacheModule.register({
      isGlobal: true,
      // store: redisStore,
      stores: [
        createKeyv({
          socket: {
            host: configuration['DB_REDIS_HOST'],
            port: parseInt(configuration['DB_REDIS_PORT']),
          },
          database: 6, //目标库,
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
    // ScheduleModule.forRoot(),
    SubappModule,
    VersionModule,
    VerifyModule,
    RobotModule,
    MockServerModule,
    AlertMsgModule,
    LoggerModule,
    FeishuEventModule,
    AiModule,
    AuthModule,
    WikiModule,
    DemoPluginModule,
    ScheduleModule.forRoot(),
    SchedulTaskeModule,
  ],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 你可以指定特定的路由
  }

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
}
