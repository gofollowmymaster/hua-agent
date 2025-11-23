import * as lark from '@larksuiteoapi/node-sdk';
import { FeishuAppClentsType } from '.';
import { getGlobalAppInstance } from '@utils/app-config';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { FeishuAppConfig, TenantCode } from '@src/config/tenant';
import { NodeConfigService } from '@src/common/service/node-config-service/node-config.service';
class FeishuClient {
  private clientContainer: Record<string, lark.Client> = {};

  constructor(clientName: FeishuAppClentsType) {
    const robotConfigs = NodeConfigService.getRobotConfig(clientName);

    Object.keys(robotConfigs).forEach((tenant) => {
      try {
        if (!robotConfigs[tenant]) {
          console.log('服务商：' + tenant + '没有配置机器人：' + clientName);
          return;
        }
        this.clientContainer[tenant] = this.create(
          robotConfigs[tenant] || {},
          clientName,
        );
      } catch (e) {
        console.log(e);
      }
    });
  }
  create({ appId, appSecret }: FeishuAppConfig, clientName: string) {
    if (!appId || !appSecret) {
      throw new Error(clientName + 'AppId and AppSecret are required');
    }
    /**
     * 报警监控机器人
     */

    return new lark.Client({
      appId,
      appSecret,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Feishu,
    });
  }
  // 用于非初始化创建实例的场景，初始化时创建获取不到tenantContext实例
  get client() {
    const tenantContext = getGlobalAppInstance(TenantContext);
    return this.clientContainer[tenantContext.tenant];
  }
  //用于初始化注入创建实例的场景
  getClient(tenant: TenantCode) {
    return this.clientContainer[tenant];
  }
}

export default FeishuClient;
