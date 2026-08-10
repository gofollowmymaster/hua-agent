/**
 * 创建带未授权跳转的 fetch，HTTP 401 时清理登录态并跳转认证中心。
 */
export function createUnauthorizedFetch(logout: () => void): typeof fetch {
  return async (input, init) => {
    const response = await fetch(input, init);
    if (response.status === 401) logout();
    return response;
  };
}
