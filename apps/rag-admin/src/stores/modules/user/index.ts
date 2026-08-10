import { defineStore } from 'pinia';
import {
  ensureLogin as loginWithAuthCenter,
  getCurrentUserInfo,
  logout as redirectLogout,
  tenantAuthConfig
} from './auth';
import { resolveTenantDisplayName } from './tenant-auth.config';
import { normalizeSdkUserInfo, resolveUserInfo, type LoginUser } from './jwt';

export type { LoginUser } from './jwt';

interface UserState {
  token?: string;
  userInfo: LoginUser;
  loginReady: boolean;
  loginLoading: boolean;
  loginError: string;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: undefined,
    userInfo: {},
    loginReady: false,
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
        console.log('[ token ] >', token);
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
