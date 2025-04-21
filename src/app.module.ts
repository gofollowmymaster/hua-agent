import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
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
import { CacheModule } from '@nestjs/cache-manager';
// import { FeishuHelperModule } from './common/feishu/hepler/helper.module';
// import { FeishuApp } from './common/feishu/clients/enum';

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
      load: [configuration],
    }),
    CacheModule.register({
      ttl: 60 * 60 * 24, // 24小时缓存
      isGlobal: true,
    }),
    // 静态资源服务
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'mockServer'),
    }),
    SubappModule,
    VersionModule,
    VerifyModule,
    RobotModule,
    MockServerModule,
    AlertMsgModule,
    LoggerModule,
    FeishuEventModule,
  ],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 你可以指定特定的路由
  }
}
