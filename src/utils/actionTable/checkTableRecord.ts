import client from './client';
export async function checkTableRecord(app_token: string, table_id: string) {
  try {
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
  } catch (err) {
    return false;
  }
}
