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
  static getOrThrow(configKey?: string) {
    const configValue = globalConfig[configKey];
    if (!configValue) {
      throw new Error(`${configKey} is not defined`);
    }
    return configValue;
  }
  static getRobotConfig(clientName: string) {
    const robotConfig = globalConfig['robots']?.[clientName];
    if (robotConfig) {
      return { aplus: robotConfig };
    }
    const tenantConfigs = globalConfig['tenantConfig'];
    const tenantRobotConfigs = {};
    for (const tenant in tenantConfigs) {
      const robotConfig =
        tenantConfigs[tenant as TenantCode]['robots']?.[clientName];
      tenantRobotConfigs[tenant] = robotConfig;
    }
    return tenantRobotConfigs;
  }

  static getFeishuTableConfig(configKey: string): Record<TenantCode, string> {
    const value = globalConfig['feishuTables'][configKey] as string;
    if (value) {
      return { aplus: value } as Record<TenantCode, string>;
    }
    const tenantConfigs = globalConfig['tenantConfig'];
    const tenantConfigValues = {} as Record<TenantCode, string>;
    for (const tenant in tenantConfigs) {
      const configValue =
        tenantConfigs[tenant as TenantCode]['feishuTables']?.[configKey];
      tenantConfigValues[tenant] = configValue;
    }
    return tenantConfigValues;
  }
  getTenantConfig(configKey?: string) {
    const tenantCode = this.tenantContext.tenant;
    return this.globalConfig['tenantConfig'][tenantCode][configKey];
  }
}
