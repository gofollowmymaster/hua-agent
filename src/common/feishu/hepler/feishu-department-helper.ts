import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import {
  FindChildrenDepartmentParams,
  FindChildrenDepartmentReturn,
} from '../type/contact';
import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuDataApiHelper from './feishu-data-api-helper';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuDepartmentHelper extends FeishuDataApiHelper {
  protected readonly useCache = true;
  protected readonly ttl = 60 * 60 * 24;
  constructor(
    // private readonly config: ConfigService,
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
    protected redisService: RedisService,
  ) {
    super(redisService);
  }

  async getDepartmentChildren(
    departmentId: string,
    params: FindChildrenDepartmentParams = {
      department_id_type: 'open_department_id',
      // page_size: 100,
    },
    useCache = false,
  ): Promise<FindChildrenDepartmentReturn> {
    return await this.readWrapper(
      async () =>
        await this.client.client.contact.v3.department.children({
          params,
          path: {
            department_id: departmentId,
          },
        }),
      useCache,
      'getDepartmentChildren:' + departmentId,
    );
  }
}

export default FeishuDepartmentHelper;
