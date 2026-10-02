/**
 * 创建带未授权处理的 fetch，HTTP 401 时清理本地登录态。
 */
export function createUnauthorizedFetch(logout: () => void): typeof fetch {
  return async (input, init) => {
    const response = await fetch(input, init);
    if (response.status === 401) logout();
    return response;
  };
}
