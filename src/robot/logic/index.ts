import { searchTableRecord } from '../../utils/actionTable/searchTableRecord';
import { customResponse } from '../dto/post-message-from-robot.dto';
const dayjs = require('dayjs');
//是否有当前问题
export async function hasCurrentQuestion(
  app_token: string,
  table_id: string,
  field_name: string,
  field_value: string,
): Promise<{ record_id: string }> {
  const res = await searchTableRecord(app_token, table_id, {
    field_names: [`${field_name}`],
    filter: {
      conjunction: 'and',
      conditions: [
        {
          field_name: field_name,
          operator: 'is',
          value: [`${field_value}`],
        },
      ],
    },
  });
  if (res.code >= 0 && res.data.total > 0) {
    return {
      record_id: res.data.items[0].record_id,
    };
  }
  return {
    record_id: '',
  };
}
//计算添加的消息格式
export function computedPayloadFields(
  arr: Array<any>,
  originalContent: string,
  sender: string,
) {
  const fieldData = arr.reduce((acc, cur) => {
    if (cur.field_name === '问题描述') {
      acc[cur.field_name] = originalContent;
    } else if (cur.field_name === '提出人') {
      acc[cur.field_name] = sender;
    } else if (cur.field_name === '提出人') {
      acc[cur.field_name] = sender;
    } else if (cur.field_name === '创建日期') {
      acc[cur.field_name] = dayjs().valueOf();
    } else if (cur.field_name === '是否解决') {
      acc[cur.field_name] = '未解决';
    }

    return acc;
  }, {});
  return fieldData;
}
//计算问题和回答的关联字段
export function computedPayloadRelateToFields(
  arr: Array<any>,
  replyContent: string,
  sender: string,
) {
  const fieldData = arr.reduce((acc, cur) => {
    if (cur.field_name === '答疑内容') {
      acc[cur.field_name] = replyContent;
    } else if (cur.field_name === '回复人') {
      acc[cur.field_name] = sender;
    } else if (cur.field_name === '回复日期') {
      acc[cur.field_name] = dayjs().valueOf();
    } else if (cur.field_name === '是否解决') {
      acc[cur.field_name] = '不确定';
    }
    return acc;
  }, {});
  return fieldData;
}
//返回消息
export function returnMessage(
  code: number,
  data: any,
  message: string,
): customResponse {
  return {
    code,
    data,
    message,
  };
}
