import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/rag-client';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { isObject } from 'lodash';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    let resMsg = exception.getResponse();
    if (typeof resMsg != 'string' && isObject(resMsg) && 'message' in resMsg) {
      resMsg = resMsg.message as object;
    }

    if (status >= 300) {
      sendExceptionToFeishu(exception, request.url);
    }
    response.status(200).json({
      code: status,
      message: resMsg,
      path: request.url,
    });
  }
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class UniqueConstraintExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = HttpStatus.CONFLICT;

    response.status(status).json({
      code: status,
      message: 'Unique constraint violation',
      error: exception.message,
    });
  }
}
