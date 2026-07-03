import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { sendExceptionToFeishu } from '@src/common/feishu/utils';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const path = httpAdapter.getRequestUrl(request);
    const hostName = httpAdapter.getRequestHostname(request);
    const data = request.body;

    const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    const reqContext = hostName + path + JSON.stringify(data);
    const message = exception.message || 'Internal Server Error';
    const responseBody = {
      code: httpStatus,
      message,
      path,
    };
    sendExceptionToFeishu(exception, reqContext);

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
