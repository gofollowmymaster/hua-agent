import client from './client';
export async function searchTableRecord(
  app_token: string,
  table_id: string,
  data: object,
) {
  const list = client.bitable.appTableRecord.search;
  const sendParams = {
    data,
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
