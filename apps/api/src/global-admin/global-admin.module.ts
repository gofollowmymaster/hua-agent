import { Module } from '@nestjs/common';
import { GuardModule } from '@src/common/guard/guard.module';
import { GlobalAdminGuard } from './common/guard/global-admin.guard';
import { GlobalAdminTenantController } from './tenant/tenant.controller';
import { GlobalAdminTenantService } from './tenant/tenant.service';

/** 统一装配无租户总控台的专用鉴权和业务子模块。 */
@Module({
  imports: [GuardModule],
  controllers: [GlobalAdminTenantController],
  providers: [GlobalAdminGuard, GlobalAdminTenantService],
})
export class GlobalAdminModule {}
