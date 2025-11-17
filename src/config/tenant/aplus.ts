export default {
  FeishuWikiSpaceIds: ['7382766506582736900'],
  XiaoAAppId: 'cli_a7b9fe27a3f8d00e',
  XiaoAAppSecret: 'I7EAE1RyP9ClVfee2btuidKZarf8JHez',

  //机器人Aplus智能体相关
  AplusAilyAppId: process.env.FEISHU_AILY_APP_ID,
  AplusAilyAppSecret: process.env.FEISHU_AILY_APP_SECRET,

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
  AilyAlertAppId: process.env.FEISHU_AILY_ALERT_APP_ID,
  AilyAlertAppSecret: process.env.FEISHU_AILY_ALERT_APP_SECRET,
  //报警机器人相关
  AlertAppId: process.env.FEISHU_ALERT_APP_APPID,
  AlertAppSecret: process.env.FEISHU_ALERT_APP_APPSECRET,
  //报警表格相关
  AlertTableAppToken: process.env.FEISHU_ALERT_APP_TOKEN,
  AlertApiTableId: process.env.FEISHU_ALERT_API_TABLE_ID,
  AlertFrontendAppId: process.env.FEISHU_ALERT_FRONTEND_TABLE_ID,
  AlertFrontendIssueTableAppId:
    process.env.FEISHU_ALERT_FRONTEND_ISUUE_TABLE_ID,
  AlertApiIssueTableId: process.env.FEISHU_ALERT_API_ISSUE_TABLE_ID,
};
