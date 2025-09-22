import * as lark from '@larksuiteoapi/node-sdk';

export type WikiDirectoryListParams = Parameters<
  lark.Client['wiki']['v2']['spaceNode']['list']
>;

export type WikiDirectoryListReturn = Awaited<
  ReturnType<lark.Client['wiki']['v2']['spaceNode']['list']>
>['data'];

export type WikiDirectoryItem = WikiDirectoryListReturn['items'][0];
export type WikiObjType = WikiDirectoryItem['obj_type'];
export type WikiTreeItem = {
  key: string;
  hasChild: boolean;
  nodeToken: string;
  parentNodeToken: string;
  objType: WikiObjType;
  title: string;
  children?: WikiTreeItem[];
};
