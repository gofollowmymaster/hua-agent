import aplus from './aplus';
import boat from './boat';
import yurex from './yurex';
export type FeishuAppConfig = {
  appId: string;
  appSecret: string;
};
export type TenantConfig = {
  FeishuWikiSpaceIds: string[];
  hostTag: string;
  WikiBlackListCheckoutGroupId: string;
  WikiBlackListCheckoutUserId: string;
  robots: {
    XiaoAClient: FeishuAppConfig;
    AuthClient?: FeishuAppConfig;
    //机器人Aplus智能体相关
    AilyAplusClient?: FeishuAppConfig;
  };

  //Aplus智能体表格相关
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
const tenantConfig: Readonly<Record<TenantCode, Readonly<TenantConfig>>> = {
  aplus,
  boat,
  yurex,
};
export default tenantConfig;
