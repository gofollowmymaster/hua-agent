import * as lark from '@larksuiteoapi/node-sdk';

//查询表数据
export type BitTableSearchParams = Parameters<
  lark.Client['bitable']['appTableRecord']['search']
>;

export type BitTableSearchPayload = BitTableSearchParams[0];
export type BitTableSearchPayloadData = BitTableSearchPayload['data'];
export type BitTableFilter = BitTableSearchPayloadData['filter'];
export type BitTableConditions = BitTableFilter['conditions'];
export type BitTableSearchPayloadParams = BitTableSearchPayload['params'];

export type BitTableSearchReturn = Awaited<
  ReturnType<lark.Client['bitable']['appTableRecord']['search']>
>;
export type BitTablePagination = BitTableSearchReturn['data'];
export type BitTableDataList = BitTablePagination['items'];

//将类型BitTableSearchReturn['data']['items']的fields字段类型转换为泛型T
export type BitTableRecord<T = Record<string, any>> = {
  fields: T;
} & Omit<BitTableSearchReturn['data']['items'][number], 'fields'>;
// export type BitTableRecord = BitTableSearchReturn['data']['items'];

//创建、编辑表数据

export type BitTableCreateParams = Parameters<
  lark.Client['bitable']['appTableRecord']['create']
>;

export type BitTableFields = BitTableCreateParams[0]['data']['fields'];

export type BitTableCreateOption = BitTableCreateParams[0]['params'];

export type BitTableCreateReturn = Awaited<
  ReturnType<lark.Client['bitable']['appTableRecord']['create']>
>;
export type BitTableCreateData = BitTableCreateReturn['data'];
export type BitTableCreateRecord = BitTableCreateReturn['data']['record'];
export type BitTableCreateRecordField = BitTableCreateRecord['fields'][0];

//获取单条记录
export type BitTableGetParams = Parameters<
  lark.Client['bitable']['appTableRecord']['get']
>;

export type BitTableGetOption = BitTableGetParams[0]['params'];
export type BitTableGetReturn = Awaited<
  ReturnType<lark.Client['bitable']['appTableRecord']['get']>
>;
export type BitTableGetData = BitTableGetReturn['data'];
export type BitTableGetRecord = BitTableGetReturn['data']['record'];

//批量删除

export type BitTableBatchDeleteParams = Parameters<
  lark.Client['bitable']['appTableRecord']['batchDelete']
>;
export type BitTableBatchDeleteReturn = Awaited<
  ReturnType<lark.Client['bitable']['appTableRecord']['batchDelete']>
>;
export type BitTableBatchDeleteReturnData = BitTableBatchDeleteReturn['data'];

// 批量更新
// export type BitTableBatchUpdateReturn = Awaited<
//   ReturnType<lark.Client['bitable']['appTableRecord']['batchUpdate']>
// >;

// export type BitTableBatchUpdateParams = Parameters<
//   lark.Client['bitable']['appTableRecord']['batchUpdate']
// >;

// export type BitTableBatchUpdateOption = BitTableBatchUpdateParams[0]['params'];
// export type BitTableBatchUpdate = BitTableBatchUpdateParams[0]['data'];
