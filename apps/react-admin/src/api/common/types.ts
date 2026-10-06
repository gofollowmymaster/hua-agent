export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function normalizePageParams(params: Record<string, unknown>) {
  const { current, ...rest } = params;
  return {
    ...rest,
    page: Number(current || params.page || 1),
    pageSize: Number(params.pageSize || 20),
  };
}
