import { Injectable, Scope } from '@nestjs/common';
import { FeishuApiException } from '@src/common/exception/feishu-api-exception';
import FeishuClient from '../clients/client';
import { TenantContext } from '@src/common/service/context/tenant.context';

@Injectable({ scope: Scope.TRANSIENT })
abstract class FeishuApiHelper {
  protected feishuClient: FeishuClient;
  protected readonly userContext: TenantContext;
  get client() {
    return this.feishuClient.getClient(this.userContext.tenant);
  }
  async requestWrapper(handler: () => Promise<any>, requestName: string = '') {
    try {
      const res = await handler();

      const { code, data } = res;
      if (code !== 0) {
        throw new FeishuApiException(
          `【${requestName || handler.name}】【${code}】   ->  ${JSON.stringify(res)}`,
          500,
        );
      }
      return data;
    } catch (e) {
      e.message = e.message + '  msg:' + e.response?.data?.msg;
      throw e;
    }
  }
}

export default FeishuApiHelper;
