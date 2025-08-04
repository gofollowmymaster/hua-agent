// import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { Injectable, Scope } from '@nestjs/common';
import { FeishuApiException } from '@src/common/exception/feishu-api-exception';

@Injectable({ scope: Scope.TRANSIENT })
abstract class FeishuApiHelper {
  // private readonly client: FeishuClient;

  async requestWrapper(handler: () => Promise<any>) {
    const res = await handler();
    const { code, data } = res;
    if (code !== 0) {
      // console.log('[ FeishuMessageHelper ] >', res);
      throw new FeishuApiException(
        `【${code}】   ->  ${JSON.stringify(res)}`,
        500,
      );
    }
    return data;
  }
}

export default FeishuApiHelper;
