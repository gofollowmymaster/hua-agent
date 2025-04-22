import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { ClientFactory } from '@src/common/feishu/clients';
import { FeishuApp } from '@src/common/feishu/clients/enum';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { buildFeishuTemplateCardMsg } from '@utils/feishu-message';
import dayjs from 'dayjs';

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

  catch(exception: Error, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.

    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const path = httpAdapter.getRequestUrl(request);
    const hostName = httpAdapter.getRequestHostname(request);
    const data = request.body;

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const culprit = hostName + path + JSON.stringify(data);
    const message = exception.message || 'Internal Server Error';
    const responseBody = {
      code: httpStatus,
      message,
      path,
    };

    //构建消息内容
    const content = buildFeishuTemplateCardMsg({
      title: 'Node Server异常报警',
      project: 'aplus-sql-server',
      color: 'red',
      culprit,
      errorMessage: message,
      errorTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      url: 'https://sls.console.aliyun.com/lognext/project/k8s-log-c893ce02efe464e778e67c48016348406/logsearch/elnkpro-prod-log?encode%3Dbase64%26queryString%3DIF9jb250YWluZXJfbmFtZV86IGFwbHVzLXNxbC1zZXJ2aWNlLXByb2Q%3D%26filterInfo%3DeyJmamNvZGUiOiIoKSIsImZxIjoiIn0%3D%26queryTimeType%3D99%26startTime%3D1731892962%26endTime%3D1731896562',
    });

    // 发送群消息
    this.messagerHelper.createInteractToGroup(
      content,
      this.config.get('DefaultAlertFeishuGroupId'),
    );
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
