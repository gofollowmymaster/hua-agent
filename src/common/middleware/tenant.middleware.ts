import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../service/context/tenant.context';
import { UserContext } from '@src/type/global';
import { TenantCode, tenantCodeMap } from '@src/config/tenant';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private readonly asyncStorage: TenantContext,
  ) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    // 从不同来源获取租户ID
    const user = await this.extractTokenFromHeader(req);

    // if (!tenantCodeMap[user.supplierCode]) {
    //   throw new Error('服务商不存在：' + user.supplierCode);
    // }
    // 设置租户上下文 默认为小往
    const context = {
      tenantCode: tenantCodeMap[user.supplierCode as TenantCode] || 'aplus',
      user: user || {},
    };

    this.asyncStorage.run(context, () => {
      next();
    });
  }

  private async extractTokenFromHeader(
    request: Request,
  ): Promise<UserContext | undefined> {
    if (request.headers.supplier) {
      return {
        supplierCode: request.headers.supplier as string,
      };
    }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const headerToken = type === 'Bearer' ? token : undefined;
    const payload = await this.jwtService.decode(headerToken);
    return payload || {};
  }
}
