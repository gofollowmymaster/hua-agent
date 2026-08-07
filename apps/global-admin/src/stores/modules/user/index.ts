import { defineStore } from 'pinia';
import {
  ensureLogin as loginWithAuthCenter,
  getCurrentUserInfo,
  logout as redirectLogout
} from './auth';
import { getToken, setToken } from './token';

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
        '总管理员'
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
    async ensureLogin() {
      if (this.loginReady && this.token) return this.token;
      this.loginLoading = true;
      this.loginError = '';
      try {
        const token = await loginWithAuthCenter();
        if (token) {
          this.setToken(token);
          this.userInfo = {
            ...this.userInfo,
            ...normalizeSdkUserInfo(await getCurrentUserInfo())
          };
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
