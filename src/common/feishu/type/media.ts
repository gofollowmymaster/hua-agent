import * as lark from '@larksuiteoapi/node-sdk';

//delete block
export type FeishuMediaDeleteParams = Parameters<
  lark.Client['drive']['v1']['media']['uploadAll']
>['0']['data'];

export type FeishuMediaDeleteReturn = Awaited<
  ReturnType<lark.Client['drive']['v1']['media']['uploadAll']>
>;
