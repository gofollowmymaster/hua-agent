import { MODULE_METADATA } from '@nestjs/common/constants';
import { GuardModule } from '@src/common/guard/guard.module';
import { GlobalAdminGuard } from './common/guard/global-admin.guard';
import { GlobalAdminModule } from './global-admin.module';
import { GlobalAdminTenantController } from './tenant/tenant.controller';
import { GlobalAdminTenantService } from './tenant/tenant.service';
import { GlobalAdminScheduleController } from './schedule/schedule.controller';
import { GlobalAdminScheduleService } from './schedule/schedule.service';

describe('GlobalAdminModule', () => {
  it('owns the tenant submodule and dedicated guard providers', () => {
    const controllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      GlobalAdminModule,
    );
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      GlobalAdminModule,
    );

    expect(controllers).toEqual([
      GlobalAdminTenantController,
      GlobalAdminScheduleController,
    ]);
    expect(providers).toEqual([
      GlobalAdminGuard,
      GlobalAdminTenantService,
      GlobalAdminScheduleService,
    ]);
  });

  it('keeps the dedicated guard out of the common GuardModule exports', () => {
    const commonGuardExports = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      GuardModule,
    );

    expect(commonGuardExports).not.toContain(GlobalAdminGuard);
  });
});
