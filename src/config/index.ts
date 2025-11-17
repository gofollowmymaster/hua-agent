// import feishu from './feishu';
import db from './db';
import tenantConfig from './tenant/index';

export default {
  //node-server报警群
  DefaultAlertFeishuGroupId: process.env.SERVER_ALERT_GROUPID,
  //dev调试报警群
  FeishuMsgDebugGroupId: 'oc_504fc5a30c33892570ffb5163b6bec93',
  //默认报警人 Ahua
  DefaultAlertFeishuUserId: process.env.DEFAULT_ALERT_USERID || '762a5468',
  ...db,
  jwtSecret: process.env.JWT_SECRET,
  sentryIntegrationToken: process.env.SENTRY_API_TOKEN,
  tenantConfig,
};
