import { defineStore } from 'pinia';
import { login, type LoginParams } from '@/api/auth/auth';
import {
  resolveTenantAuthConfig,
  resolveTenantDisplayName
} from './tenant-auth.config';
import { resolveUserInfo, type LoginUser } from './jwt';

export type { LoginUser } from './jwt';

interface UserState {
  token?: string;
  userInfo: LoginUser;
  loginReady: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: undefined,
    userInfo: {},
    loginReady: false
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
      return (
        state.userInfo.supplierCode ||
        resolveTenantAuthConfig(window.location.hostname).supplierCode
      );
    },
    tenantDisplayName(state) {
      const supplierCode =
        state.userInfo.supplierCode ||
        resolveTenantAuthConfig(window.location.hostname).supplierCode;
      return (
        state.userInfo.tenantName ||
        state.userInfo.supplierName ||
        resolveTenantDisplayName(supplierCode) ||
        'RAG'
      );
    }
  },
  actions: {
    setToken(token?: string) {
      this.token = token;
      this.userInfo = resolveUserInfo(token);
      this.loginReady = Boolean(token);
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
      return this.token;
    },
    async login(params: LoginParams) {
      const { token } = await login(params);
      this.setToken(token);
      return token;
    },
    logout() {
      this.setToken(undefined);
    }
  },
  persist: {
    key: 'authToken',
    pick: ['token', 'userInfo'],
    afterHydrate(context) {
      const store = context.store as unknown as UserState & {
        setUserInfo: (userInfo: LoginUser) => void;
      };
      store.loginReady = Boolean(store.token);
      if (store.token) store.setUserInfo(resolveUserInfo(store.token));
    }
  }
});
