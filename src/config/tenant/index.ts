import aplus from './aplus';
import boat from './boat';
import yurex from './yurex';
export type FeishuAppConfig = {
  appId: string;
  appSecret: string;
};
export type TenantConfig = {
  FeishuWikiSpaceIds: string[];
  robots: {
    XiaoAClient: FeishuAppConfig;
    AuthClient?: FeishuAppConfig;
    //机器人Aplus智能体相关

    AilyAplusClient?: FeishuAppConfig;
  };

  //Aplus智能体表格相关
  AilyLogTableAppToken?: string;
  AilyLogOperatorTableId?: string;
};
export type TenantRobots = keyof TenantConfig['robots'];

export const tenantCodeMap = {
  B0004: 'aplus',
  CO3906: 'boat',
  B0006: 'yurex',
} as const;
//定义一个类型，为tenantCodeMap的值的集合
export type TenantCode = (typeof tenantCodeMap)[keyof typeof tenantCodeMap];
const tenantConfig: Readonly<Record<TenantCode, Readonly<TenantConfig>>> = {
  aplus,
  boat,
  yurex,
};
export default tenantConfig;
