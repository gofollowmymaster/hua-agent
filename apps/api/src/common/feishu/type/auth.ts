import * as lark from '@larksuiteoapi/node-sdk';

export type FeishuAuthType = Awaited<
  ReturnType<lark.Client['authen']['refreshAccessToken']['create']>
>['data'];
