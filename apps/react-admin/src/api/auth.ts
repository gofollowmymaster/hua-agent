import { http } from './common/http';
import { resolveTenantAuthConfig } from '@/auth/tenant';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

export function login(params: LoginParams) {
  const tenant = resolveTenantAuthConfig(window.location.hostname);
  return http.post<unknown, LoginResult>('/auth/login', params, {
    headers: { supplier: tenant.supplierCode },
  });
}
