import client from './client';
export async function listTableField(app_token: string, table_id: string) {
  const res = await client.bitable.appTableField.list({
    path: {
      app_token: app_token,
      table_id: table_id,
    },
  });
  return res;
}
