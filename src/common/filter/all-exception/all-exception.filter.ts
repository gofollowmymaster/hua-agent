import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import feishuClient from '@src/common/feishu-robot/alert-client';
import { buildFeishuTemplateCardMsg } from '@utils/feishu-message';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || 'Internal Server Error';
    const responseBody = {
      code: httpStatus,
      message,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    //构建消息内容
    const content = buildFeishuTemplateCardMsg({ ...alertInfo });

    // 发送群消息
    feishuClient.im.message.create({
      data: {
        receive_id: feishuGroupId,
        msg_type: 'interactive',
        content,
      },
      params: {
        receive_id_type: 'chat_id',
      },
    });
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
