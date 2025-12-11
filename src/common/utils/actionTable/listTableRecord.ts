import client from './client';
export async function listTableRecord(app_token: string, table_id: string) {
  const list = client.bitable.appTableRecord.list;
  const sendParams = {
    path: {
      app_token: app_token,
      table_id: table_id,
    },
    params: {
      page_size: 500,
    },
  };
  const res = await list(sendParams);
  return res;
}
