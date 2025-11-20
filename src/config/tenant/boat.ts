export default {
  FeishuWikiSpaceIds: ['7549126549107195906'],

  XiaoAClient: {
    appId: 'cli_a85a4dc1c9259013',
    appSecret: 'wmea3GufO6ADkITtv0CjkexcZmpCAsWi',
  },
  AuthClient: {
    appId: process.env.FEISHU_AUTH_APP_ID,
    appSecret: process.env.FEISHU_AUTH_APP_SECRET,
  },
  //机器人Aplus智能体相关

  AilyAplusClient: {
    appId: process.env.FEISHU_AILY_APP_ID,
    appSecret: process.env.FEISHU_AILY_APP_SECRET,
  },

  //Aplus智能体表格相关
  AilyLogTableAppToken:
    process.env.FEISHU_AILY_APLUS_APP_TOKEN || 'A6qfbapjtafVLYsn9xic6mYNnfT',
  AilyLogOperatorTableId:
    process.env.FEISHU_AILY_APLUS_TABLE_ID || 'tblcE7q8e2vD9c48',
  //Aplus Node-Server 管理表格
  AplusNodeAdminAppToken: process.env.FEISHU_APLUS_NODE_ADMIN_APP_TOKEN,
  AplusNodeAdminMtableTableId:
    process.env.FEISHU_APLUS_NODE_ADMIN_MTABLE_TABLE_ID,
  //Aily智能报警提示相关
  AiAlertClient: {
    appId: process.env.FEISHU_AILY_ALERT_APP_ID,
    appSecret: process.env.FEISHU_AILY_ALERT_APP_SECRET,
  },

  //报警机器人相关
  FeishuAlertClient: {
    appId: process.env.FEISHU_ALERT_APP_APPID,
    appSecret: process.env.FEISHU_ALERT_APP_APPSECRET,
  },

  //报警表格相关
  AlertTableAppToken: process.env.FEISHU_ALERT_APP_TOKEN,
  AlertApiTableId: process.env.FEISHU_ALERT_API_TABLE_ID,
  AlertFrontendAppId: process.env.FEISHU_ALERT_FRONTEND_TABLE_ID,
  AlertFrontendIssueTableAppId:
    process.env.FEISHU_ALERT_FRONTEND_ISUUE_TABLE_ID,
  AlertApiIssueTableId: process.env.FEISHU_ALERT_API_ISSUE_TABLE_ID,
};
