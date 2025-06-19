import {
  Module,
  MiddlewareConsumer,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
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
import { AilyLogOperatorModule } from '@src/ai/log-operator/log-operator.module';
import { LoggerModule } from './common/service/logger/logger.module';
import configuration from './config';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './aplus/auth/auth.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { Cache } from 'cache-manager';

// import { ScheduleModule } from '@nestjs/schedule';
import { WikiModule } from './wiki/wiki.module';
// import { FeishuHelperModule } from './common/feishu/hepler/helper.module';
import { DemoPluginModule } from './demo-plugin/demo-plugin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulTaskeModule } from './common/schedule-task/schedule-task.module';

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
      store: redisStore,
      host: configuration['DB_REDIS_HOST'],
      port: configuration['DB_REDIS_PORT'],
      db: configuration['DB_REDIS_DB'], //目标库,
      auth_pass: configuration['DB_REDIS_PASSPORT'], // 密码,没有可以不写
    }),
    // 静态资源服务
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'mockServer'),
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
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
    AilyLogOperatorModule,
    AuthModule,
    WikiModule,
    DemoPluginModule,
    ScheduleModule.forRoot(),
    SchedulTaskeModule,
  ],
  providers: [PrismaService],
})
export class AppModule implements OnModuleInit {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 你可以指定特定的路由
  }

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async onModuleInit() {
    try {
      await this.cacheManager.set('test_key', 'test_value', 60);
      const value = await this.cacheManager.get('test_key');
      console.log('Redis test value:', value); // 应输出 "test_value"
    } catch (error) {
      console.error('Redis connection error:', error);
    }
  }
}
