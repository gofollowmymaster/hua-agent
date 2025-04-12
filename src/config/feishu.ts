export default {
  AlertAppId: process.env.FEISHU_ALERT_APP_APPID || 'cli_a7c7e073b579500e',
  AlertAppSecret:
    process.env.FEISHU_ALERT_APP_APPSECRET ||
    'M8jpmdjcb8wvAxjU2Wlk2cULx0Cobeap',
  AlertTableAppToken: process.env.FEISHU_ALERT_APP_TOKEN,
  AlertApiTableId: process.env.FEISHU_ALERT_API_TABLE_ID,
  AlertFrontendAppId: process.env.FEISHU_ALERT_APP_TOKEN,
  //默认报警群
  DefaultAlertFeishuGroupId:
    process.env.DEFAULT_ALERT_GROUPID || 'oc_b030f5155cad2838eeacadc977f403b0',
  //默认报警人 Ahua
  DefaultAlertFeishuUserId: process.env.DEFAULT_ALERT_USERID || '762a5468',
};
