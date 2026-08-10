export interface LoginUser {
  userId?: string;
  userName?: string;
  email?: string;
  avatar?: string;
  supplierCode?: string;
  supplierName?: string;
  tenantCode?: string;
  tenantName?: string;
}

function readString(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value) return value;
  }
  return undefined;
}

/** 解析 JWT payload，解析失败时返回空对象。 */
export function parseJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split('.');
  if (!payload) return {};

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      window
        .atob(normalized)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** 从 JWT 中提取登录用户基础信息，兼容 camelCase 与 snake_case 字段。 */
export function resolveUserInfo(token?: string): LoginUser {
  if (!token) return {};

  const payload = parseJwtPayload(token);
  return {
    userId: readString(payload, ['userId', 'user_id', 'sub', 'id']),
    userName: readString(payload, ['userName', 'username', 'name', 'nickname']),
    email: readString(payload, ['email', 'mail']),
    avatar: readString(payload, ['avatar', 'avatarUrl']),
    supplierCode: readString(payload, ['supplierCode', 'supplier_code']),
    supplierName: readString(payload, ['supplierName', 'supplier_name']),
    tenantCode: readString(payload, ['tenantCode', 'tenant_code']),
    tenantName: readString(payload, ['tenantName', 'tenant_name'])
  };
}

/** 将登录 SDK 返回的用户信息规范化为统一字段。 */
export function normalizeSdkUserInfo(userInfo: unknown): LoginUser {
  if (!userInfo || typeof userInfo !== 'object') return {};

  const data = userInfo as Record<string, unknown>;
  return {
    userId: readString(data, ['userCode', 'unionId', 'id']),
    userName: readString(data, ['userName', 'realName', 'name']),
    email: readString(data, ['email']),
    avatar: readString(data, ['avatar']),
    supplierCode: readString(data, ['supplierCode', 'supplier_code']),
    supplierName: readString(data, ['supplierName', 'supplier_name']),
    tenantCode: readString(data, ['tenantCode']),
    tenantName: readString(data, ['tenantName'])
  };
}
