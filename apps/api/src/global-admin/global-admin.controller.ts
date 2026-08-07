import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GlobalAdminGuard } from '@src/common/guard/global-admin';
import {
  GlobalAdminTenantDetailDto,
  GlobalAdminTenantSummaryDto,
} from './dto/global-admin-tenant.dto';
import { GLOBAL_ADMIN_ROUTE_PREFIX } from './global-admin.constants';
import { GlobalAdminTenantService } from './global-admin-tenant.service';

/** 提供不依赖 TenantContext 的总控台只读接口。 */
@ApiTags('Global Admin 总控台')
@UseGuards(GlobalAdminGuard)
@Controller(GLOBAL_ADMIN_ROUTE_PREFIX)
export class GlobalAdminController {
  constructor(private readonly tenantService: GlobalAdminTenantService) {}

  /** 返回所有已配置租户的脱敏摘要。 */
  @Get('tenants')
  @ApiOperation({ summary: '查询总控台租户列表' })
  @ApiOkResponse({ type: GlobalAdminTenantSummaryDto, isArray: true })
  listTenants() {
    return this.tenantService.list();
  }

  /** 返回指定租户的脱敏配置状态。 */
  @Get('tenants/:tenantCode')
  @ApiOperation({ summary: '查询总控台租户详情' })
  @ApiOkResponse({ type: GlobalAdminTenantDetailDto })
  getTenant(@Param('tenantCode') tenantCode: string) {
    return this.tenantService.get(tenantCode);
  }
}
