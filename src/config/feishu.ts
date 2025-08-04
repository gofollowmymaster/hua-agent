export default {
  //机器人Aplus鉴权应用
  AplusAuthAppId: process.env.FEISHU_AUTH_APP_ID,
  AplusAuthAppSecret: process.env.FEISHU_AUTH_APP_SECRET,
  //机器人小A相关
  XiaoAAppId: process.env.FEISHU_APP_ID,
  XiaoAAppSecret: process.env.FEISHU_APP_SECRET,
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
  //node-server报警群
  DefaultAlertFeishuGroupId:
    process.env.DEFAULT_ALERT_GROUPID || 'oc_b030f5155cad2838eeacadc977f403b0',
  //dev调试报警群
  FeishuMsgDebugGroupId: 'oc_504fc5a30c33892570ffb5163b6bec93',
  //默认报警人 Ahua
  DefaultAlertFeishuUserId: process.env.DEFAULT_ALERT_USERID || '762a5468',

  FeishuAplusWikiSpaceId: process.env.FEISHU_APLUS_WIWI_SPACE_ID,
};
