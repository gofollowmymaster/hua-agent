export type FeishuEventHeader = {
  event_id: string;
  event_type: string;
  create_time: string;
  token: string;
  app_id: string;
  tenant_key: string;
};

export type MsgReadEvent = {
  reader: {
    reader_id: {
      union_id: string;
      user_id: string;
      open_id: string;
    };
    read_time: string;
    tenant_key: string;
  };
  message_id_list: string[];
};

export type FeishuEventCallbackBase = {
  schema: string;
  header: FeishuEventHeader;
  challenge?:string;
  type?:string
};

export type FeishuEventCallbackDto = FeishuEventCallbackBase & {
  event: MsgReadEvent;
};
