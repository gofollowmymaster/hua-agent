import client from './client';
import type { records } from './interface';
export async function updateTableRecord(
  app_token: string,
  table_id: string,
  record_id: string,
  records: records,
) {
  const update = client.bitable.appTableRecord.update;
  const sendParams = {
    path: {
      app_token: app_token,
      table_id: table_id,
      record_id: record_id,
    },
    data: {
      fields: records,
    },
  };
  const res = await update(sendParams);
  return res;
}
