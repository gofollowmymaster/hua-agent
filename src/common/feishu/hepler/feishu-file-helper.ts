import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuDataApiHelper from './feishu-data-api-helper';
import {
  FeishuFileDeleteParams,
  FeishuFileDeletePath,
  FeishuFileDeleteReturn,
} from '../type/file';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuFileHelper extends FeishuDataApiHelper {
  protected readonly useCache = false;
  protected readonly ttl = 60 * 60 * 24;
  constructor(
    // private readonly config: ConfigService,
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
    protected redisService: RedisService,
  ) {
    super(redisService);
  }

  async deleteFile(
    params: FeishuFileDeleteParams,
    path: FeishuFileDeletePath,
  ): Promise<FeishuFileDeleteReturn> {
    return await this.requestWrapper(
      () =>
        this.client.client.drive.v1.file.delete({
          params,
          path,
        }),
      'deleteFile',
    );
  }
}

export default FeishuFileHelper;
