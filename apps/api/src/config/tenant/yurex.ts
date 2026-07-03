import { TenantConfig } from '.';

function booleanEnv(key: string, fallback: boolean) {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

const yurexConfig: TenantConfig = {
  FeishuWikiSpaceIds: ['7583921476789652686'],
  hostTag: 'yurex',
  //wiki黑名单检测通知群
  WikiBlackListCheckoutGroupId: 'oc_73081755e8517d3846182d1b195e129e',
  //wiki黑名单检测通知人
  WikiBlackListCheckoutUserId: '762a5468',
  feishuTables: {},
  robots: {
    WikiClient: {
      appId: 'cli_a9243e8665781cb2',
      appSecret: 'gNxYxMs6njDh91RSi5AcSeKcWnzJVzcu',
    },
    AilyAplusClient: {
      appId: process.env.FEISHU_AILY_APP_ID_APLUS,
      appSecret: process.env.FEISHU_AILY_APP_SECRET_APLUS,
    },
  },
  wecomBot: {
    vcHelperClient: {
      enabled: false,
      botId: '',
      secret: '',
    },
  },
};

export default yurexConfig;
