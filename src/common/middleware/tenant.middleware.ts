import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

type Payload = {
  supplierName: string;
  loginId: string;
  tenantCode: string;
  appCode: 'APLUS' | 'ADMIN' | 'QUICK';
  supplierCode: string;
  userId: number;
  userCode: string;
  loginTime: number;
  tenantName: string;
  scope: 'WEB' | 'APP';
  tenantId: number;
  username: string;
};
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    // 从不同来源获取租户ID
    const payload = await this.extractTokenFromHeader(req);
    // 设置租户上下文
    req['userInfo'] = payload;
    req['supplierCode'] = payload.supplierCode;
    next();
  }

  private async extractTokenFromHeader(
    request: Request,
  ): Promise<Payload | undefined> {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const headerToken = type === 'Bearer' ? token : undefined;
    const payload = await this.jwtService.decode(headerToken);
    return payload;
  }
}
