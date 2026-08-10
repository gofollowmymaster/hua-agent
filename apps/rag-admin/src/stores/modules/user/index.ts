import { defineStore } from 'pinia';
import {
  ensureLogin as loginWithAuthCenter,
  getCurrentUserInfo,
  logout as redirectLogout,
  tenantAuthConfig
} from './auth';
import { resolveTenantDisplayName } from './tenant-auth.config';
import { getToken, setToken } from './token';

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

interface UserState {
  token?: string;
  userInfo: LoginUser;
  loginReady: boolean;
  loginLoading: boolean;
  loginError: string;
}

function parseJwtPayload(token: string): Record<string, unknown> {
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

function readString(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value) return value;
  }
  return undefined;
}

function resolveUserInfo(token?: string): LoginUser {
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

function normalizeSdkUserInfo(userInfo: unknown): LoginUser {
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

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken(),
    userInfo: resolveUserInfo(getToken()),
    loginReady: Boolean(getToken()),
    loginLoading: false,
    loginError: ''
  }),
  getters: {
    displayName(state) {
      return (
        state.userInfo.userName ||
        state.userInfo.email ||
        state.userInfo.userId ||
        '已登录用户'
      );
    },
    isLoggedIn(state) {
      return Boolean(state.token);
    },
    supplierCode(state) {
      return state.userInfo.supplierCode || tenantAuthConfig.supplierCode;
    },
    tenantDisplayName(state) {
      const supplierCode =
        state.userInfo.supplierCode || tenantAuthConfig.supplierCode;
      return (
        state.userInfo.tenantName ||
        state.userInfo.supplierName ||
        resolveTenantDisplayName(supplierCode) ||
        'RAG'
      );
    }
  },
  actions: {
    setLoginError(message: string) {
      this.loginError = message;
    },
    setToken(token?: string) {
      this.token = token;
      this.userInfo = resolveUserInfo(token);
      this.loginReady = Boolean(token);
      setToken(token);
    },
    setUserInfo(userInfo: LoginUser) {
      const merged = { ...this.userInfo };
      (Object.keys(userInfo) as Array<keyof LoginUser>).forEach((key) => {
        const value = userInfo[key];
        if (value !== undefined) merged[key] = value;
      });
      this.userInfo = merged;
    },
    async ensureLogin() {
      if (this.loginReady && this.token) return this.token;

      this.loginLoading = true;
      this.loginError = '';
      try {
        const token = await loginWithAuthCenter();
        if (token) {
          this.setToken(token);
          const userInfo = await getCurrentUserInfo();
          this.setUserInfo(normalizeSdkUserInfo(userInfo));
        }
        return token;
      } finally {
        this.loginLoading = false;
      }
    },
    logout() {
      this.setToken(undefined);
      redirectLogout();
    }
  }
});
