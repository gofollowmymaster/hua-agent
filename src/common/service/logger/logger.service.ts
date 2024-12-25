import winston, { Logger, createLogger, format, transports } from 'winston';
import { config } from './logger.config';

import { Injectable } from '@nestjs/common';

winston.addColors(config.colors);
export const logger = createLogger({
  level: 'info', // 仅当 info.level 小于或等于此级别时才记录
  levels: winston.config.npm.levels,
  // winston 格式定义
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.json(),
  ),

  // 生成文件

  // winston 文档中使用的方法为 new transports.File()

  // 因为加入日志归档等相关功能，所以使用transports.DailyRotateFile()方法来实现

  transports: [
    // 打印到控制台，生产可注释关闭该功能

    new transports.Console(),

    // 保存到文件
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});
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

  error(message: string, ctx?: any, meta?: Record<string, any>): Logger {
    return this.logger.error({
      message,
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }

  // 警告日志记录

  warn(message: string, ctx?: any, meta?: Record<string, any>): Logger {
    return this.logger.warn({
      message: JSON.stringify(message),
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }

  // debug日志记录

  debug(message: string, ctx: any, meta?: Record<string, any>): Logger {
    return this.logger.debug({
      message: JSON.stringify(message),
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }

  // 基本日志记录

  info(message: string, ctx?: any, meta?: Record<string, any>): Logger {
    return this.logger.info({
      message: JSON.stringify(message),
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }
}
