import FeishuClient from '../clients/client';

import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import {
  ContactUserGetReturnType,
  DepartmentIdType,
  UserIdType,
  FindByDepartmentParams,
} from '../type/contact';
import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuDataApiHelper from './feishu-data-api-helper';
import { TenantContext } from '@src/common/service/context/tenant.context';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuUserHelper extends FeishuDataApiHelper {
  protected readonly useCache = true;
  protected readonly ttl = 60 * 60 * 24;
  constructor(
    @Inject(FEISHU_CLIENT_ID) protected readonly feishuClient: FeishuClient,
    protected readonly userContext: TenantContext,
    protected redisService: RedisService,
  ) {
    super(redisService);
  }
  async getUserInfo(
    {
      userId,
      userIdType,
      departmentIdType,
    }: {
      userId: string;
      userIdType: UserIdType;
      departmentIdType?: DepartmentIdType;
    },
    useCache = true,
  ): Promise<ContactUserGetReturnType> {
    return await this.readWrapper(
      async () =>
        await this.client.contact.user.get({
          params: {
            user_id_type: userIdType,
            department_id_type: departmentIdType,
          },
          path: {
            user_id: userId,
          },
        }),
      useCache,
      'getUserInfo:' + userId,
    );
  }

  async getUserIdByEmailOrPhone({
    emails,
    mobiles,
    includeResigned,
    userIdType,
  }: {
    emails?: string[];
    mobiles?: string[];
    includeResigned?: false;
    userIdType: UserIdType;
  }): Promise<ContactUserGetReturnType> {
    return await this.readWrapper(
      async () =>
        await this.client.contact.user.batchGetId({
          data: {
            emails,
            mobiles,
            include_resigned: includeResigned,
          },
          params: {
            user_id_type: userIdType,
          },
        }),
      true,
      'getUserInfo',
    );
  }

  async getUserByDepartment(
    params: FindByDepartmentParams,
  ): Promise<ContactUserGetReturnType> {
    return await this.readWrapper(
      async () =>
        await this.client.contact.user.findByDepartment({
          params,
        }),
      true,
      'getUserByDepartment',
    );
  }
}

export default FeishuUserHelper;
