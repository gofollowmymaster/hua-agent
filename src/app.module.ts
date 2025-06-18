import { Module, MiddlewareConsumer } from '@nestjs/common';
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
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './aplus/auth/auth.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

// import { ScheduleModule } from '@nestjs/schedule';
import { AilyWikiModule } from './wiki/wiki.module';
// import { FeishuHelperModule } from './common/feishu/hepler/helper.module';
import { DemoPluginModule } from './demo-plugin/demo-plugin.module';

const envFilePath = [
  '.env',
  `.env.${process.env.NODE_ENV}`,
  `.env.${process.env.NODE_ENV}.local`,
];
console.log('[ envFilePath ] >', envFilePath);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePath,
      isGlobal: true,
      load: [() => configuration],
    }),
    // CacheModule.register({
    //   ttl: 60 * 60 * 24, // 24小时缓存
    //   isGlobal: true,
    // }),
    CacheModule.register({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          store: redisStore,
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          db: configService.get('REDIS_DB'), //目标库,
          auth_pass: configService.get('REDIS_PASSPORT'), // 密码,没有可以不写
        };
      },
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
    AilyWikiModule,
    DemoPluginModule,
  ],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 你可以指定特定的路由
  }
}
