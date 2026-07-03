import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from './auth';
import { SecretAuthGuard } from './secret-auth';

@Injectable()
export class CompositeAuthOrSecretGuard implements CanActivate {
  constructor(
    private authGuard: AuthGuard,
    private secretAuthGuard: SecretAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('缺少认证信息');
    }

    if (authHeader.startsWith('Bearer ')) {
      return await this.authGuard.canActivate(context);
    } else {
      return await this.secretAuthGuard.canActivate(context);
    }
  }
}
