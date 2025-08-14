import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import {
  ContactUserGetReturnType,
  DepartmentIdType,
  UserIdType,
} from '../type/contact';
import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuDataApiHelper from './feishu-data-api-helper';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuUserHelper extends FeishuDataApiHelper {
  protected readonly useCache = true;
  protected readonly ttl = 60 * 60 * 24;
  constructor(
    // private readonly config: ConfigService,
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
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
        await this.client.client.contact.user.get({
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
        await this.client.client.contact.user.batchGetId({
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
}

export default FeishuUserHelper;
