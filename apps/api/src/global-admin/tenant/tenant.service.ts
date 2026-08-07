import { Injectable, NotFoundException } from '@nestjs/common';
import tenantConfig, { TenantCode, tenantCodeMap } from '@src/config/tenant';
import {
  GlobalAdminTenantDetailDto,
  GlobalAdminTenantSummaryDto,
  SupplierCode,
} from './dto/tenant.dto';

type TenantDefinition = {
  supplierCode: SupplierCode;
  tenantCode: TenantCode;
  displayName: string;
};

const TENANT_DEFINITIONS: readonly TenantDefinition[] = [
  {
    supplierCode: 'A',
    tenantCode: tenantCodeMap.A,
    displayName: 'Aplus',
  },
  {
    supplierCode: 'C',
    tenantCode: tenantCodeMap.C,
    displayName: '小往',
  },
  {
    supplierCode: 'D',
    tenantCode: tenantCodeMap.D,
    displayName: 'Yurex',
  },
];

/** 从静态租户配置生成总控台可读取的安全投影。 */
@Injectable()
export class GlobalAdminTenantService {
  /** 按服务商 A、C、D 的稳定顺序返回租户摘要。 */
  list(): GlobalAdminTenantSummaryDto[] {
    return TENANT_DEFINITIONS.map((definition) =>
      this.createSummary(definition),
    );
  }

  /** 返回指定租户的基础信息和脱敏能力状态。 */
  get(tenantCode: string): GlobalAdminTenantDetailDto {
    const definition = TENANT_DEFINITIONS.find(
      (item) => item.tenantCode === tenantCode,
    );
    if (!definition) {
      throw new NotFoundException(`租户不存在: ${tenantCode}`);
    }

    const config = tenantConfig[definition.tenantCode];
    return {
      ...this.createSummary(definition),
      capabilities: {
        wiki: Boolean(config.FeishuWikiSpaceIds?.length),
        auth: Boolean(config.robots.AuthClient?.appId),
        aily: Boolean(config.robots.AilyAplusClient?.appId),
        wecomBot: Boolean(config.wecomBot?.vcHelperClient?.enabled),
      },
    };
  }

  /** 仅选择允许进入列表响应的公开字段。 */
  private createSummary(
    definition: TenantDefinition,
  ): GlobalAdminTenantSummaryDto {
    return {
      supplierCode: definition.supplierCode,
      tenantCode: definition.tenantCode,
      displayName: definition.displayName,
      hostTag: tenantConfig[definition.tenantCode].hostTag,
    };
  }
}
