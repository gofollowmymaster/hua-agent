import { TenantConfig } from '.';
const yurexConfig: TenantConfig = {
  FeishuWikiSpaceIds: ['7583921476789652686'],
  hostTag: 'yurex',
  //wiki黑名单检测通知群
  WikiBlackListCheckoutGroupId: 'oc_73081755e8517d3846182d1b195e129e',
  //wiki黑名单检测通知人
  WikiBlackListCheckoutUserId: '762a5468',
  feishuTables: {},
  robots: {
    XiaoAClient: {
      appId: 'cli_a7b9fe27a3f8d00e',
      appSecret: 'I7EAE1RyP9ClVfee2btuidKZarf8JHez',
    },
    AilyAplusClient: {
      appId: process.env.FEISHU_AILY_APP_ID_APLUS,
      appSecret: process.env.FEISHU_AILY_APP_SECRET_APLUS,
    },
  },
};

export default yurexConfig;
