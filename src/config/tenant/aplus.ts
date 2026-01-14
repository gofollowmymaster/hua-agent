import { TenantConfig } from '.';
const aplusConfig: TenantConfig = {
  FeishuWikiSpaceIds: ['7382766506582736900'],
  hostTag: 'lnk',
  //wiki黑名单检测通知群
  WikiBlackListCheckoutGroupId: 'oc_79cc868ad3680d77b1d17c769d42c06a',
  robots: {
    XiaoAClient: {
      appId: 'cli_a7b9fe27a3f8d00e',
      appSecret: 'I7EAE1RyP9ClVfee2btuidKZarf8JHez',
    },
    AuthClient: {
      appId: 'cli_a6d55e522f71900e',
      appSecret: 'JQnGCO6eQtXFTEuZP0ZFCcJwZYKQ31e3',
    },

    AilyAplusClient: {
      appId: process.env.FEISHU_AILY_APP_ID_APLUS,
      appSecret: process.env.FEISHU_AILY_APP_SECRET_APLUS,
    },
  },
  feishuTables: {
    //Aplus智能体表格相关
    AilyLogTableAppToken:
      process.env.FEISHU_AILY_APLUS_APP_TOKEN || 'CccVb85n4aVC7hsWjVhcY5YfnSe',
    AilyLogOperatorTableId:
      process.env.FEISHU_AILY_APLUS_TABLE_ID || 'tblcE7q8e2vD9c48',
  },
};

export default aplusConfig;
