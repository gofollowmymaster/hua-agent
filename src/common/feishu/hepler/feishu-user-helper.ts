import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import FeishuApiHelper from './feishu-api-helper';
import {
  ContactUserGetReturnType,
  DepartmentIdType,
  UserIdType,
} from '../type/contact';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuUserHelper extends FeishuApiHelper {
  constructor(
    // private readonly config: ConfigService,
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
  ) {
    super();
  }
  async getUserInfo({
    userId,
    userIdType,
    departmentIdType,
  }: {
    userId: string;
    userIdType: UserIdType;
    departmentIdType?: DepartmentIdType;
  }): Promise<ContactUserGetReturnType> {
    return await this.requestWrapper(
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
    );
  }
}

export default FeishuUserHelper;
