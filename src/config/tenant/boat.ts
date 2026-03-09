import { TenantConfig } from '.';
const boatConfig: TenantConfig = {
  FeishuWikiSpaceIds: ['7549126549107195906'],
  hostTag: 'boat',
  //wiki黑名单检测通知群
  WikiBlackListCheckoutGroupId: 'oc_05458c875fe1007b24bac8f2fa057a3a',
  //wiki黑名单检测通知人
  WikiBlackListCheckoutUserId: '762a5468',
  feishuTables: {
    //Aplus智能体表格相关
    AilyLogTableAppToken: 'A6qfbapjtafVLYsn9xic6mYNnfT',
    AilyLogOperatorTableId: 'tblcE7q8e2vD9c48',
  },

  robots: {
    WikiClient: {
      appId: 'cli_a85a4dc1c9259013',
      appSecret: 'wmea3GufO6ADkITtv0CjkexcZmpCAsWi',
    },
    AuthClient: {
      appId: 'cli_a6d55e522f71900e',
      appSecret: 'JQnGCO6eQtXFTEuZP0ZFCcJwZYKQ31e3',
    },
    //机器人Aplus智能体相关

    AilyAplusClient: {
      appId: 'cli_a85a4dc1c9259013',
      appSecret: 'wmea3GufO6ADkITtv0CjkexcZmpCAsWi',
    },
  },
};

export default boatConfig;
