import * as lark from '@larksuiteoapi/node-sdk';

//delete block
export type FeishuFileDeleteParams = Parameters<
  lark.Client['drive']['v1']['file']['delete']
>['0']['params'];
export type FeishuFileDeletePath = Parameters<
  lark.Client['drive']['v1']['file']['delete']
>['0']['path'];

export type FeishuFileDeleteReturn = Awaited<
  ReturnType<lark.Client['drive']['v1']['file']['delete']>
>['data'];
