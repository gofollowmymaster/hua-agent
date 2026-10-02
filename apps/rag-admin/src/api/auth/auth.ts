import { http } from '@/api/common/http';
import { resolveTenantAuthConfig } from '@/stores/modules/user/tenant-auth.config';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

/** 请求当前域名对应租户的本地登录接口。 */
export function login(params: LoginParams) {
  const tenant = resolveTenantAuthConfig(window.location.hostname);
  return http.post<unknown, LoginResult>('/auth/login', params, {
    headers: { supplier: tenant.supplierCode }
  });
}
