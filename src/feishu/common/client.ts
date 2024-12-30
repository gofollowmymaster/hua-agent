import * as lark from '@larksuiteoapi/node-sdk';
/**
 * 报警监控机器人
 */
const client = new lark.Client({
  appId: 'cli_a7c7e073b579500e',
  appSecret: 'M8jpmdjcb8wvAxjU2Wlk2cULx0Cobeap',
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu,
});

export default client;
