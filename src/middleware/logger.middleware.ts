import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as winston from 'winston';
import { isArray, isObject } from '@utils/is';
import { config } from './logger.config';
const dayjs = require('dayjs');
winston.addColors(config.colors);
export const logger = winston.createLogger({
  level: 'info',
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    logger.info(
      `请求开始【${req.method} - ${req.originalUrl}】 请求头:【${JSON.stringify(req.headers)}】请求体参数:【${JSON.stringify(req.body)}】时间:【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】`,
    );

    // 打印请求结束时的响应数据
    res.on('finish', () => {
      logger.info(
        `请求结束 【${res.statusCode} - ${res.statusMessage}】 时间:【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】`,
      );
    });
    next();
  }
}
