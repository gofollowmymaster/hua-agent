export type FeishuEventHeader = {
  event_id: string;
  event_type: string;
  create_time: string;
  token: string;
  app_id: string;
  tenant_key: string;
};

export type FeishuEventCallbackBase = {
  schema: string;
  header: FeishuEventHeader;
  challenge?: string;
  type?: string;
};

export type FeishuEventCallbackDto = FeishuEventCallbackBase & {
  event: Record<string, any>;
};
