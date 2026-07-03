import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../service/logger/logger.config';
const dayjs = require('dayjs');
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    logger.info(
      `请求开始【${req.method} - ${req.originalUrl}】 请求头:【${JSON.stringify(req.headers)}】请求体参数:【${JSON.stringify(req.body)}】时间:【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】`,
    );

    const startTime = Date.now();
    // 打印请求结束时的响应数据
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info(
        `请求结束 【${res.statusCode} - ${res.statusMessage}】响应时长：【${JSON.stringify(duration)}】`,
      );
    });
    next();
  }
}
