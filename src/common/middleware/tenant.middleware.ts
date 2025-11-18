import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../service/context/tenant.context';
import { UserContext } from '@src/type/global';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private readonly asyncStorage: TenantContext,
  ) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    // 从不同来源获取租户ID
    const payload = await this.extractTokenFromHeader(req);
    // 设置租户上下文

    const user = payload; // 从认证中间件获取的用户信息

    const context = {
      user: user || {
        supplierCode: 'B0004',
        appCode: 'APLUS',
      },
    };

    this.asyncStorage.run(context, () => {
      next();
    });
  }

  private async extractTokenFromHeader(
    request: Request,
  ): Promise<UserContext | undefined> {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const headerToken = type === 'Bearer' ? token : undefined;
    const payload = await this.jwtService.decode(headerToken);
    return payload;
  }
}
