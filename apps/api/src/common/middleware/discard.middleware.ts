import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { sendExceptionToFeishu } from '../feishu/utils';

@Injectable()
export class DiscardMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (['mock-server'].includes(req.originalUrl.split('/')[1])) {
      sendExceptionToFeishu(
        new Error('当前访问废弃的功能'),
        '当前访问地址：' + req.originalUrl,
      );
      next(new ForbiddenException('功能已废弃，如有疑问请联系开发人员'));
    } else {
      next();
    }
  }
}
