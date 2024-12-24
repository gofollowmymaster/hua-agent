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
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.prod'],
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
  ],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 你可以指定特定的路由
  }
}
