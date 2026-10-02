import { ForbiddenException } from '@nestjs/common';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { SystemAdminGuard } from './system-admin.guard';

describe('SystemAdminGuard', () => {
  it('allows a JWT payload marked as a system administrator', () => {
    const guard = new SystemAdminGuard({
      user: { isSystemAdmin: true },
    } as TenantContext);

    expect(guard.canActivate()).toBe(true);
  });

  it('rejects a regular user', () => {
    const guard = new SystemAdminGuard({ user: {} } as TenantContext);

    expect(() => guard.canActivate()).toThrow(ForbiddenException);
  });
});
