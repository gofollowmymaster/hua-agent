import FeishuClient from '../clients/client';

import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuDataApiHelper from './feishu-data-api-helper';
import {
  FeishuMediaDeleteParams,
  FeishuMediaDeleteReturn,
} from '../type/media';
import { TenantContext } from '@src/common/service/context/tenant.context';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuMediaHelper extends FeishuDataApiHelper {
  protected readonly useCache = false;
  constructor(
    @Inject(FEISHU_CLIENT_ID) protected readonly feishuClient: FeishuClient,
    protected readonly userContext: TenantContext,
    protected redisService: RedisService,
  ) {
    super(redisService);
  }

  async upload(
    data: FeishuMediaDeleteParams,
  ): Promise<FeishuMediaDeleteReturn> {
    return await this.client.drive.v1.media.uploadAll({
      data,
    });
  }
}

export default FeishuMediaHelper;
