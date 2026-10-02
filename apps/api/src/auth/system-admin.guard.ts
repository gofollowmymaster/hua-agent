import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common';
import { TenantContext } from '@src/common/service/context/tenant.context';

/** 限制用户管理接口只能由当前租户的系统管理员访问。 */
@Injectable()
export class SystemAdminGuard implements CanActivate {
  constructor(private readonly tenantContext: TenantContext) {}

  /** 校验 JWT 中的系统管理员标记。 */
  canActivate(): boolean {
    if (!this.tenantContext.user?.isSystemAdmin) {
      throw new ForbiddenException('需要系统管理员权限');
    }
    return true;
  }
}
