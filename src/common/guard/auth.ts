import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.verify(token);
      request['user'] = payload;
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
    return true;
  }
  private async verify(token: string) {
    const payload = await this.jwtService.verify(token);
    const loginTime = payload.loginTime;
    if (loginTime < dayjs().subtract(7, 'day').valueOf() / 1000) {
      throw new UnauthorizedException('登录已过期');
    }
    return payload;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
