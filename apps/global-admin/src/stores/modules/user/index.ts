import { defineStore } from 'pinia';
import {
  ensureLogin as loginWithAuthCenter,
  getCurrentUserInfo,
  logout as redirectLogout
} from './auth';

export interface LoginUser {
  userId?: string;
  userName?: string;
  email?: string;
  avatar?: string;
}

interface UserState {
  token?: string;
  userInfo: LoginUser;
  loginReady: boolean;
  loginLoading: boolean;
  loginError: string;
}

function readString(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if ((typeof value === 'string' || typeof value === 'number') && value) {
      return String(value);
    }
  }
  return undefined;
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

function resolveUserInfo(token?: string): LoginUser {
  if (!token) return {};
  const payload = parseJwtPayload(token);
  return {
    userId: readString(payload, ['userId', 'user_id', 'sub', 'id']),
    userName: readString(payload, ['userName', 'username', 'name', 'nickname']),
    email: readString(payload, ['email', 'mail']),
    avatar: readString(payload, ['avatar', 'avatarUrl'])
  };
}

function normalizeSdkUserInfo(userInfo: unknown): LoginUser {
  if (!userInfo || typeof userInfo !== 'object') return {};
  const data = userInfo as Record<string, unknown>;
  return {
    userId: readString(data, ['userCode', 'unionId', 'id']),
    userName: readString(data, ['userName', 'realName', 'name']),
    email: readString(data, ['email']),
    avatar: readString(data, ['avatar'])
  };
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
        '总管理员'
      );
    },
    isLoggedIn(state) {
      return Boolean(state.token);
    }
  },
  actions: {
    setLoginError(message: string) {
      this.loginError = message;
    },
    setUserInfo(userInfo: LoginUser) {
      const merged = { ...this.userInfo };
      (Object.keys(userInfo) as Array<keyof LoginUser>).forEach((key) => {
        const value = userInfo[key];
        if (value !== undefined) merged[key] = value;
      });
      this.userInfo = merged;
    },
    setToken(token?: string) {
      this.token = token;
      this.userInfo = resolveUserInfo(token);
      this.loginReady = Boolean(token);
    },
    async ensureLogin() {
      if (this.loginReady && this.token) return this.token;
      this.loginLoading = true;
      this.loginError = '';
      try {
        const token = await loginWithAuthCenter();
        if (token) {
          this.setToken(token);
          this.setUserInfo(normalizeSdkUserInfo(await getCurrentUserInfo()));
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
