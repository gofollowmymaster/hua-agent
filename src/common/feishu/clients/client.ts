import * as lark from '@larksuiteoapi/node-sdk';
import { FeishuAppClentsType } from '.';
import globalConfig from '@src/config';
import { getGlobalAppInstance } from '@utils/app-config';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { TenantCode } from '@src/config/tenant';
class FeishuClient {
  private clientContainer: Record<string, lark.Client> = {};
  constructor(clientName: FeishuAppClentsType) {
    const tenantConfig = globalConfig['tenantConfig'];
    Object.keys(tenantConfig).forEach((tenant) => {
      try {
        this.clientContainer[tenant] = this.create(
          tenantConfig[tenant][clientName] || {},
          clientName,
        );
      } catch (e) {
        console.log(e);
        console.log(
          '[ tenantConfig[tenant] ] >',
          tenant,
          clientName,
          tenantConfig[tenant],
        );
      }
    });
  }
  create(
    { appId, appSecret }: { appId: string; appSecret: string },
    clientName: string,
  ) {
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
    console.log('[ tenantContext ] >', tenantContext.tenant);
    return this.clientContainer[tenantContext.tenant];
  }
  //用于初始化注入创建实例的场景
  getClient(tenant: TenantCode) {
    return this.clientContainer[tenant];
  }
}

export default FeishuClient;
