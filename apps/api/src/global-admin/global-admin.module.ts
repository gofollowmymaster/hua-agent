import { Module } from '@nestjs/common';
import { GuardModule } from '@src/common/guard/guard.module';
import { GlobalAdminController } from './global-admin.controller';
import { GlobalAdminTenantService } from './global-admin-tenant.service';

/** 注册无租户总控台的授权和只读租户目录。 */
@Module({
  imports: [GuardModule],
  controllers: [GlobalAdminController],
  providers: [GlobalAdminTenantService],
})
export class GlobalAdminModule {}
