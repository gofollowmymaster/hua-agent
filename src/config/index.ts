import db from './db';
import tenantConfig from './tenant/index';
const globalConfig = Object.freeze({
  //node-server报警群
  DefaultAlertFeishuGroupId: process.env.SERVER_ALERT_GROUPID,
  //dev调试报警群
  FeishuMsgDebugGroupId: 'oc_504fc5a30c33892570ffb5163b6bec93',
  //默认报警人 Ahua
  DefaultAlertFeishuUserId: '762a5468',
  ...db,
  jwtSecret: process.env.JWT_SECRET,
  sentryIntegrationToken: process.env.SENTRY_API_TOKEN,
  //报警表格相关
  AlertTableAppToken: process.env.FEISHU_ALERT_APP_TOKEN,
  AlertApiTableId: process.env.FEISHU_ALERT_API_TABLE_ID,
  AlertFrontendAppId: process.env.FEISHU_ALERT_FRONTEND_TABLE_ID,
  AlertFrontendIssueTableAppId:
    process.env.FEISHU_ALERT_FRONTEND_ISUUE_TABLE_ID,
  AlertApiIssueTableId: process.env.FEISHU_ALERT_API_ISSUE_TABLE_ID,
  //Aplus Node-Server 管理表格
  AplusNodeAdminAppToken: process.env.FEISHU_APLUS_NODE_ADMIN_APP_TOKEN,
  AplusNodeAdminMtableTableId:
    process.env.FEISHU_APLUS_NODE_ADMIN_MTABLE_TABLE_ID,

  robots: {
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
  },

  //服务商特性配置
  tenantConfig,
} as const);

export default globalConfig;

//todo 获取机器人配置   获取服务商具体配置项
