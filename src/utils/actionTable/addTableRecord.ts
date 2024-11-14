import client from './client';
import type { records } from './interface';
export async function addTableRecord(
  app_token: string,
  table_id: string,
  records: records,
) {
  try {
    const res = await client.bitable.appTableRecord.create({
      path: {
        app_token: app_token,
        table_id: table_id,
      },
      data: {
        fields: records,
      },
    });
    return res;
  } catch (err) {
    return false;
  }
}
