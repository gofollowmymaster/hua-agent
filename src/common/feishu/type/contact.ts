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
export type ContactUserType = ContactUserGetReturnType['user'];

export type FindByDepartmentParams = Parameters<
  lark.Client['contact']['user']['findByDepartment']
>['0']['params'];

export type FindChildrenDepartmentParams = Parameters<
  lark.Client['contact']['v3']['department']['children']
>['0']['params'];

export type FindChildrenDepartmentReturn = Awaited<
  ReturnType<lark.Client['contact']['v3']['department']['children']>
>['data'];
