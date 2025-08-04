import * as lark from '@larksuiteoapi/node-sdk';

export type ContactUserGetParams = Parameters<
  lark.Client['contact']['user']['get']
>;
export type UserIdType = ContactUserGetParams['0']['params']['user_id_type'];
export type DepartmentIdType =
  ContactUserGetParams['0']['params']['department_id_type'];
// export type UserIdType = ContactUserParams['0']['params'];

export type ContactUserGetReturnType = Awaited<
  ReturnType<lark.Client['contact']['user']['get']>
>['data'];
