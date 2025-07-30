import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { BaseException } from '@src/common/exception/base-exception';

@Catch()
export class AplusExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: BaseException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const path = httpAdapter.getRequestUrl(request);
    const hostName = httpAdapter.getRequestHostname(request);
    const data = request.body;

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception.code || HttpStatus.INTERNAL_SERVER_ERROR;
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
