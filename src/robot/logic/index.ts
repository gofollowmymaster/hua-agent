import { searchTableRecord } from '../../utils/actionTable/searchTableRecord';
import { logger } from '../../middleware/logger.middleware';
//是否有当前问题
export async function hasCurrentQuestion(
  app_token: string,
  table_id: string,
  field_name: string,
  field_value: string,
): Promise<{ record_id: string }> {
  const res = await searchTableRecord(app_token, table_id, {
    field_names: [`${field_name}`],
    data: {
      field_name: [`${field_name}`],
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
    },
  });
  logger.info(
    `飞书接口【searchTableRecord】返回查询结果为 【${JSON.stringify(res)}】`,
  );
  if (res.code >= 0 && res.data.total > 0) {
    return {
      record_id: res.data.items[0].record_id,
    };
  }
  return {
    record_id: '',
  };
}
