import * as lark from '@larksuiteoapi/node-sdk';

class FeishuClient {
  public client: lark.Client;
  constructor(appId: string, appSecret: string) {
    /**
     * 报警监控机器人
     */

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

export default FeishuClient;
