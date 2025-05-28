import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';

import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { AplusError } from '@src/common/exception/interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private messagerHelper;
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    // private readonly alertInfo: Record<string, any>,
    private readonly config: ConfigService,
    // private readonly messagerHelper: FeishuMessageHelper,
  ) {
    this.messagerHelper = new FeishuMessageHelper(
      ClientFactory.create(FeishuApp.AlertClient, config),
    );
  }

  catch(exception: AplusError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const path = httpAdapter.getRequestUrl(request);
    const hostName = httpAdapter.getRequestHostname(request);
    const data = exception.response?.data || request.body;

    // exception instanceof AxiosError
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const culprit = hostName + path + JSON.stringify(data);
    const message = exception.message || 'Internal Server Error';
    console.log('[ exception ] >', exception);
    const responseBody = {
      code: httpStatus,
      message,
      path,
    };
    if (typeof exception == 'object') {
      exception.culprit = culprit;
    } else {
      exception = {
        name: 'Error',
        message: exception,
        culprit,
      };
    }
    sendExceptionToFeishu(exception, this.config);

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
