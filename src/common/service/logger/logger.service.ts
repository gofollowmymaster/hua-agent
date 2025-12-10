import { Logger } from 'winston';

import { Injectable } from '@nestjs/common';
import { logger } from './logger.config';

@Injectable()
export class LoggerService {
  private context?: string;

  private logger: Logger;

  public setContext(context: string): void {
    this.context = context;
  }

  constructor() {
    this.logger = logger;
  }

  // 错误日志记录

  error(message: any, ctx?: any, meta?: Record<string, any>): Logger {
    return this.logger.error({
      message,
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }

  // 警告日志记录

  warn(message: any, ctx?: any, meta?: Record<string, any>): Logger {
    return this.logger.warn({
      message: JSON.stringify(message),
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }

  // debug日志记录

  debug(message: any, ctx?: any, meta?: Record<string, any>): Logger {
    return this.logger.debug({
      message: JSON.stringify(message),
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }

  // 基本日志记录

  info(message: any, ctx?: any, meta?: Record<string, any>): Logger {
    return this.logger.info({
      message: JSON.stringify(message),
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }
}
