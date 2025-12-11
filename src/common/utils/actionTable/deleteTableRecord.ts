import client from './client';
export async function deleteTableRecord(
  app_token: string,
  table_id: string,
  record_id: string,
) {
  const deleteFn = client.bitable.appTableRecord.delete;
  const sendParams = {
    path: {
      app_token: app_token,
      table_id: table_id,
      record_id: record_id,
    },
  };
  const res = await deleteFn(sendParams);
  return res;
}
