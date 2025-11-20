export default {
  FeishuWikiSpaceIds: ['7382766506582736900'],
  robots: {
    XiaoAClient: {
      appId: 'cli_a7b9fe27a3f8d00e',
      appSecret: 'I7EAE1RyP9ClVfee2btuidKZarf8JHez',
    },
    AuthClient: {
      appId: 'cli_a6d55e522f71900e',
      appSecret: 'JQnGCO6eQtXFTEuZP0ZFCcJwZYKQ31e3',
    },
    //机器人Aplus智能体相关

    AilyAplusClient: {
      appId: process.env.FEISHU_AILY_APP_ID,
      appSecret: process.env.FEISHU_AILY_APP_SECRET,
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
