import { Injectable } from '@nestjs/common';
import globalConfig from '@src/config';
import { TenantContext } from '../context/tenant.context';
import { TenantCode } from '@src/config/tenant';
@Injectable()
export class NodeConfigService {
  private readonly globalConfig = globalConfig;
  constructor(private readonly tenantContext: TenantContext) {}
  static get(configKey?: string) {
    return globalConfig[configKey];
  }
  static getRobotConfig(clientName: string) {
    const robotConfig = globalConfig['robots']?.[clientName];
    if (robotConfig) {
      return { aplus: robotConfig };
    }
    const tenantConfigs = globalConfig['tenantConfig'];
    for (const tenant in tenantConfigs) {
      const robotConfig =
        tenantConfigs[tenant as TenantCode]['robots']?.[clientName];
      tenantConfigs[tenant] = robotConfig;
    }
    return tenantConfigs;
  }
  getTenantConfig(configKey?: string) {
    const tenantCode = this.tenantContext.tenant;
    return this.globalConfig['tenantConfig'][tenantCode][configKey];
  }
}
