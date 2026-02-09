import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodeConfigService } from '@src/config/node-config.service';
import { UserContext } from '@src/type/global';
import dayjs from 'dayjs';
import { Request } from 'express';
import { NotReportException } from '../exception/not-report-exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new NotReportException('缺少必要的token信息', 401);
    }
    try {
      const payload = await this.verify(token);
      request['user'] = payload;
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
    return true;
  }
  private async verify(token: string): Promise<UserContext> {
    const payload = await this.jwtService.verify(token);
    const loginTime = payload.loginTime;
    const dayNum = Number(NodeConfigService.get('jwtTokenExpired'));
    if (loginTime < dayjs().subtract(dayNum, 'day').valueOf() / 1000) {
      throw new UnauthorizedException('登录已过期');
    }
    return payload;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
