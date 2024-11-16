import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as winston from 'winston';
const dayjs = require('dayjs');
const logger = winston.createLogger({
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
      `${req.method} ${req.originalUrl} ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
    );
    res.on('finish', () => {
      logger.info(
        `${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`,
      );
    });
    next();
  }
}
