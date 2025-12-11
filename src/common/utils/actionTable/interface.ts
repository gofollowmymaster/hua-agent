export type records = {
  fields: Record<
    string,
    | string
    | number
    | number
    | number
    | boolean
    | {
        text?: string;
        link?: string;
      }
    | {
        location?: string;
        pname?: string;
        cityname?: string;
        adname?: string;
        address?: string;
        name?: string;
        full_address?: string;
      }
    | Array<{
        id?: string;
        name?: string;
        avatar_url?: string;
      }>
    | Array<string>
    | Array<{
        id?: string;
        name?: string;
        en_name?: string;
        email?: string;
      }>
    | Array<{
        file_token?: string;
        name?: string;
        type?: string;
        size?: number;
        url?: string;
        tmp_url?: string;
      }>
  >;
};

export type searchParams = Partial<{
  user_id_type?: 'user_id' | 'union_id' | 'open_id';
  page_token?: string;
  page_size?: number;
}>;

export type Field = {
  field_id: string;
  field_name: string;
  is_primary: boolean;
  property: any; // 如果你知道 property 的具体类型，可以替换 any
  type: number;
  ui_type: string;
};
