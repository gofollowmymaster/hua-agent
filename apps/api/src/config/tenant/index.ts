import { FeishuAppConfig, WecomRagBotConfig } from '../interface';
import aplus from './aplus';
import boat from './boat';
import yurex from './yurex';

export type TenantConfig = {
  FeishuWikiSpaceIds: string[];
  hostTag: string;
  WikiBlackListCheckoutGroupId: string;
  WikiBlackListCheckoutUserId: string;
  robots: {
    WikiClient: FeishuAppConfig;
    AuthClient?: FeishuAppConfig;
    //机器人Aplus智能体相关
    AilyAplusClient?: FeishuAppConfig;
  };

  //Aplus智能体表格相关
  feishuTables: Record<string, string>;
  wecomBot?: {
    vcHelperClient?: WecomRagBotConfig;
  };
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
