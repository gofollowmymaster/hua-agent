import { FeishuAppConfig } from '../interface';
import aplus from './aplus';
import boat from './boat';
import yurex from './yurex';

export type TenantConfig = {
  hostTag: string;
  robots: Record<string, FeishuAppConfig>;
  feishuTables: Record<string, string>;
};
export type TenantRobots = keyof TenantConfig['robots'];
export type TenantConfigKey = keyof TenantConfig;

export enum tenantCodeMap {
  A = 'aplus',
  C = 'boat',
  D = 'yurex',
}
//服务商码
export type TenantCode = (typeof tenantCodeMap)[keyof typeof tenantCodeMap];
export type TenantConfigType = Readonly<
  Record<TenantCode, Readonly<TenantConfig>>
>;
const tenantConfig: TenantConfigType = {
  aplus,
  boat,
  yurex,
};
export default tenantConfig;
