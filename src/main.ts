import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  HttpExceptionFilter,
  UniqueConstraintExceptionFilter,
} from './common/filter/http-exception/http-exception.filter';
import { AllExceptionsFilter } from './common/filter/all-exception/all-exception.filter';
import { TransformInterceptor } from './common/interceptor/transform/transform.interceptor';
import * as bodyParser from 'body-parser';
import utc from 'dayjs/plugin/utc'; // nodejs
import timezone from 'dayjs/plugin/timezone'; // nodejs
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';

declare const module: any;

dayjs.extend(utc);
dayjs.extend(timezone);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapter = app.get(HttpAdapterHost);
  const config = app.get(ConfigService);
  app.enableCors();
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new UniqueConstraintExceptionFilter(),
    new AllExceptionsFilter(httpAdapter, config),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  // 增加请求体大小限制
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
