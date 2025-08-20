// import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { Injectable, Scope } from '@nestjs/common';
import { FeishuApiException } from '@src/common/exception/feishu-api-exception';

@Injectable({ scope: Scope.TRANSIENT })
abstract class FeishuApiHelper {
  async requestWrapper(handler: () => Promise<any>, requestName: string = '') {
    const res = await handler();
    const { code, data } = res;
    if (code !== 0) {
      throw new FeishuApiException(
        `【${requestName || handler.name}】【${code}】   ->  ${JSON.stringify(res)}`,
        500,
      );
    }
    return data;
  }
}

export default FeishuApiHelper;
