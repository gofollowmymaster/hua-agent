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

    response.status(status).json({
      code: status,
      timestamp: new Date().toISOString(),
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
      message: 'subappName已存在！',
      error: exception.message,
    });
  }
}
