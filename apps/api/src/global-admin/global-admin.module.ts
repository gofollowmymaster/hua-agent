import { Module } from '@nestjs/common';
import { GuardModule } from '@src/common/guard/guard.module';
import { GlobalAdminGuard } from './common/guard/global-admin.guard';
import { GlobalAdminTenantController } from './tenant/tenant.controller';
import { GlobalAdminTenantService } from './tenant/tenant.service';
import { GlobalAdminScheduleController } from './schedule/schedule.controller';
import { GlobalAdminScheduleService } from './schedule/schedule.service';

/** 统一装配无租户总控台的专用鉴权和业务子模块。 */
@Module({
  imports: [GuardModule],
  controllers: [GlobalAdminTenantController, GlobalAdminScheduleController],
  providers: [
    GlobalAdminGuard,
    GlobalAdminTenantService,
    GlobalAdminScheduleService,
  ],
})
export class GlobalAdminModule {}
