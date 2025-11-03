import * as lark from '@larksuiteoapi/node-sdk';

export type DocxCreateReturn = Awaited<
  ReturnType<lark.Client['docx']['v1']['document']['create']>
>['data'];
export type DocxConvertReturn = Awaited<
  ReturnType<lark.Client['docx']['v1']['document']['convert']>
>['data'];
export type DocxConvertData = Parameters<
  lark.Client['docx']['v1']['document']['convert']
>['0']['data'];

export type DocumentBlockDescendantCreateData = Parameters<
  lark.Client['docx']['v1']['documentBlockDescendant']['create']
>['0']['data'];
export type DocumentBlockDescendantCreatePath = Parameters<
  lark.Client['docx']['v1']['documentBlockDescendant']['create']
>['0']['path'];
export type DocumentBlockDescendantCreateParams = Parameters<
  lark.Client['docx']['v1']['documentBlockDescendant']['create']
>['0']['params'];

export type DocumentBlockDescendantCreateReturn = Awaited<
  ReturnType<lark.Client['docx']['v1']['documentBlockDescendant']['create']>
>['data'];
