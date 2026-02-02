export type EphemeralSendParams = {
  chat_id: string;
  open_id?: string;
  user_id?: string;
  email?: string;
  msg_type: string;
  card: Record<string, any>;
};
export type EphemeralSendReturn = {
  message_id: string;
};
