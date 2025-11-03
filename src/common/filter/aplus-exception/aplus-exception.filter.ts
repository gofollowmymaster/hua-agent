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
import { isNumber } from 'lodash';

/**
 * 自定义异常拦截器
 * todo: 该拦截器会导致请求没有返回数据，暂时注释掉
 */
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
        : isNumber(exception.code)
          ? exception.code
          : HttpStatus.INTERNAL_SERVER_ERROR;
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
