import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { logger } from '../service/logger/logger.config';
import { UserContext } from '@src/type/global';

export interface Response<T> {
  body: T;
}

@Injectable()
export class LoggingInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private isLogRequest: boolean;
  private readonly logger = logger;
  private readonly sensitiveFields = ['password'];

  // 应该记录的路径（所有）
  private readonly shouldLogPaths = ['/'];

  // 不应该记录的路径
  private readonly excludePaths = [
    '/health',
    '/metrics',
    '/favicon.ico',
    '/static/',
    '/uploads/',
  ];

  constructor(isLogRequest: boolean = true) {
    this.isLogRequest = isLogRequest;
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    // 判断是否需要记录
    if (!this.shouldLogRequest(request)) {
      return next.handle();
    }

    const startTime = performance.now();
    const requestId = this.generateRequestId(request);
    const userInfo = this.extractUserInfo(request);

    // 记录请求信息
    this.isLogRequest && this.logRequest(request, requestId, userInfo);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = performance.now() - startTime;
          this.logSuccessResponse(
            request,
            response,
            data,
            responseTime,
            requestId,
          );
        },
        error: (error) => {
          const responseTime = performance.now() - startTime;
          this.logErrorResponse(
            request,
            response,
            error,
            responseTime,
            requestId,
          );
        },
      }),
    );
  }

  private shouldLogRequest(req: Request): boolean {
    const path = req.url;

    // 检查排除路径
    if (this.excludePaths.some((exclude) => path.startsWith(exclude))) {
      return false;
    }

    // 检查包含路径
    return this.shouldLogPaths.some((include) => path.startsWith(include));
  }

  private logRequest(req: Request, requestId: string, userInfo: any): void {
    const logEntry = {
      requestId,
      path: req.url,
      timestamp: new Date().toISOString(),
      method: req.method,
      body: this.maskSensitiveData(req.body),
      userId: userInfo?.userId,
      userRole: userInfo?.role,
    };

    this.logger.info('请求信息:' + JSON.stringify(logEntry));
  }

  private logSuccessResponse(
    req: Request,
    res: any,
    data: any,
    responseTime: number,
    requestId: string,
  ): void {
    const statusCode = res.statusCode;
    const logEntry = {
      path: req.url,
      requestId,
      timestamp: new Date().toISOString(),
      data,
      statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
    };

    // 根据状态码选择日志级别
    const logLevel = statusCode >= 400 ? 'warn' : 'info';
    this.logger[logLevel]('响应信息:' + JSON.stringify(logEntry));
  }

  private logErrorResponse(
    req: Request,
    res: any,
    error: any,
    responseTime: number,
    requestId: string,
  ): void {
    const statusCode = error?.status || error?.statusCode || 500;
    const logEntry = {
      path: req.url,
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack:
        process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    };

    this.logger.error('响应信息:' + JSON.stringify(logEntry));
  }

  private maskSensitiveData(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    const masked = Array.isArray(obj) ? [...obj] : { ...obj };

    this.sensitiveFields.forEach((field) => {
      if (masked[field] !== undefined) {
        masked[field] = '***MASKED***';
      }
    });

    // 递归处理嵌套对象
    Object.keys(masked).forEach((key) => {
      if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = this.maskSensitiveData(masked[key]);
      }
    });

    return masked;
  }

  private generateRequestId(req: Request): string {
    return (
      (req.headers['x-request-id'] as string) ||
      `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    );
  }

  private extractUserInfo(req: Request): UserContext {
    // 从请求中提取用户信息
    return (req as any).user;
  }
}
