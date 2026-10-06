import { useMemo, useState } from 'react';
import { login as requestLogin, type LoginParams } from '@/api/auth';
import { readAuthState, writeAuthState } from '@/auth/storage';
import {
  resolveTenantAuthConfig,
  resolveTenantDisplayName,
} from '@/auth/tenant';

export default function useAuthModel() {
  const [state, setState] = useState(readAuthState);

  return useMemo(() => {
    const userInfo = state.userInfo;
    const supplierCode =
      userInfo.supplierCode ||
      resolveTenantAuthConfig(window.location.hostname).supplierCode;
    return {
      token: state.token,
      userInfo,
      isLoggedIn: Boolean(state.token),
      displayName:
        userInfo.userName || userInfo.email || userInfo.userId || '已登录用户',
      supplierCode,
      tenantDisplayName:
        userInfo.tenantName ||
        userInfo.supplierName ||
        resolveTenantDisplayName(supplierCode) ||
        'RAG',
      setToken(token?: string) {
        setState(writeAuthState(token));
      },
      async login(params: LoginParams) {
        const result = await requestLogin(params);
        setState(writeAuthState(result.token));
        return result.token;
      },
      logout() {
        setState(writeAuthState(undefined));
      },
    };
  }, [state]);
}
