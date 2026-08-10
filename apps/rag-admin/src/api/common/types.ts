export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GridPageResult<T> {
  records: T[];
  total: number;
}

export function normalizeGridPageParams(params: Record<string, unknown>) {
  return Object.entries(params).reduce<Record<string, unknown>>(
    (result, [key, value]) => {
      if (value === undefined || value === null || value === '') return result;
      if (isEmptyObject(value)) return result;

      result[key === 'current' ? 'page' : key] = value;
      return result;
    },
    {},
  );
}

function isEmptyObject(value: unknown) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}
