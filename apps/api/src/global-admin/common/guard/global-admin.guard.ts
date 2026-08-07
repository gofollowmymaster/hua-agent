import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { NodeConfigService } from '@src/config/node-config.service';
import { UserContext } from '@src/type/global';
import { Request } from 'express';
import { AuthGuard } from '@src/common/guard/auth';

type AuthenticatedRequest = Request & { user?: UserContext };

/** 限制只有专用 Global Admin 应用签发的用户 JWT 可以访问总控台 API。 */
@Injectable()
export class GlobalAdminGuard implements CanActivate {
  constructor(private readonly authGuard: AuthGuard) {}

  /** 复用用户 JWT 校验，并在成功后校验专用 appCode。 */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = await this.authGuard.canActivate(context);
    if (!authenticated) return false;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const expectedAppCode = NodeConfigService.get('globalAdminAppCode');

    if (!expectedAppCode || request.user?.appCode !== expectedAppCode) {
      throw new ForbiddenException('无总控台访问权限');
    }

    return true;
  }
}
