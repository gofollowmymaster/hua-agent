import * as lark from '@larksuiteoapi/node-sdk';

class FeishuClient {
  public client: lark.Client;
  constructor(appId: string, appSecret: string) {
    /**
     * 报警监控机器人
     */
    console.log('[ appId1 ] >', appId);
    console.log('[ appSecret1 ] >', appSecret);
    this.client = new lark.Client({
      appId,
      appSecret,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Feishu,
    });
  }
}
export interface FeishuClientInterface {
  client: lark.Client;
}
// export const client = new FeishuClient(
//   'cli_a7c7e073b579500e',
//   'M8jpmdjcb8wvAxjU2Wlk2cULx0Cobeap',
// );

export default FeishuClient;
