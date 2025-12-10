import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  HttpExceptionFilter,
  UniqueConstraintExceptionFilter,
} from './common/filter/http-exception/http-exception.filter';
import { AllExceptionsFilter } from './common/filter/all-exception/all-exception.filter';
import { AplusExceptionsFilter } from './common/filter/aplus-exception/aplus-exception.filter';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import * as bodyParser from 'body-parser';
import utc from 'dayjs/plugin/utc'; // nodejs
import timezone from 'dayjs/plugin/timezone'; // nodejs
import dayjs from 'dayjs';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { setGlobalAppInstance } from '@src/common/utils/app-config';
import { LoggingInterceptor } from './common/interceptor/logger.interceptor';

declare const module: any;

dayjs.extend(utc);
dayjs.extend(timezone);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setGlobalAppInstance(app);
  const httpAdapter = app.get(HttpAdapterHost);
  app.enableCors({
    origin: true, // 或设置为 true 允许所有
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
    credentials: true, // 允许发送 cookies
  });
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapter),
    new AplusExceptionsFilter(httpAdapter),
    new HttpExceptionFilter(),
    new UniqueConstraintExceptionFilter(),
  );
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
    }),
  );
  // 增加请求体大小限制
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  if (process.env.NODE_ENV == 'dev') {
    const config = new DocumentBuilder()
      .setTitle('Aplus Frontend Node')
      .setDescription('The Aplus Frontend Node API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document, {
      jsonDocumentUrl: 'swagger/json',
    });
  }
  // 设置全局配置

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
