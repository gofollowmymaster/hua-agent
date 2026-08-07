import { ApiProperty } from '@nestjs/swagger';
import { TenantCode } from '@src/config/tenant';

export type SupplierCode = 'A' | 'C' | 'D';

/** 总控台租户列表允许公开的基础字段。 */
export class GlobalAdminTenantSummaryDto {
  @ApiProperty({ enum: ['A', 'C', 'D'] })
  supplierCode: SupplierCode;

  @ApiProperty({ enum: ['aplus', 'boat', 'yurex'] })
  tenantCode: TenantCode;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  hostTag: string;
}

/** 总控台仅以布尔值公开的租户集成能力。 */
export class GlobalAdminTenantCapabilitiesDto {
  @ApiProperty()
  wiki: boolean;

  @ApiProperty()
  auth: boolean;

  @ApiProperty()
  aily: boolean;

  @ApiProperty()
  wecomBot: boolean;
}

/** 总控台租户详情的脱敏响应。 */
export class GlobalAdminTenantDetailDto extends GlobalAdminTenantSummaryDto {
  @ApiProperty({ type: GlobalAdminTenantCapabilitiesDto })
  capabilities: GlobalAdminTenantCapabilitiesDto;
}
