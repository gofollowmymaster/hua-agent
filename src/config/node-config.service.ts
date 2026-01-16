import { Injectable } from '@nestjs/common';
import globalConfig from '@src/config';
import { TenantCode, TenantConfigKey, tenantCodeMap } from '@src/config/tenant';
import { GlobalConfigKey } from './interface';
@Injectable()
export class NodeConfigService {
  static get(configKey?: GlobalConfigKey): any {
    return globalConfig[configKey];
  }
  static getOrThrow(configKey?: GlobalConfigKey): any {
    const configValue = globalConfig[configKey];
    if (!configValue) {
      throw new Error(`${configKey} is not defined`);
    }
    return configValue;
  }
  static getRobotConfig(clientName: string) {
    const robotConfig = globalConfig['robots']?.[clientName];
    if (robotConfig) {
      return Object.values(tenantCodeMap).reduce((prev, tenant) => {
        prev[tenant] = robotConfig;
        return prev;
      }, {});
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
      return Object.values(tenantCodeMap).reduce((prev, tenant) => {
        prev[tenant] = value;
        return prev;
      }, {}) as Record<TenantCode, string>;
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
  static getTenantConfigItem(tenant: TenantCode, configKey: TenantConfigKey) {
    return globalConfig['tenantConfig'][tenant][configKey];
  }
  static getTenantConfigItemAll(configKey: TenantConfigKey) {
    return Object.keys(globalConfig['tenantConfig']).reduce((prev, next) => {
      prev[next] = globalConfig['tenantConfig'][next]?.[configKey];
      return prev;
    }, {});
  }
}
