import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const resMsg = exception.getResponse();

    console.log('返回错误', resMsg);
    response.status(status).json({
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
