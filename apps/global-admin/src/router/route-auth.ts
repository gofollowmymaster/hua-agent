export interface GlobalAdminRouteUserStore {
  ensureLogin: () => Promise<unknown>;
  setLoginError: (message: string) => void;
  logout: () => void;
}

/** 完成路由登录准备，并把认证错误交给已挂载的后台布局展示。 */
export async function prepareGlobalAdminRoute(
  userStore: GlobalAdminRouteUserStore
): Promise<boolean> {
  try {
    const token = await userStore.ensureLogin();
    if (!token) {
      userStore.logout();
      return false;
    }
    return true;
  } catch (error) {
    userStore.setLoginError(
      error instanceof Error ? error.message : String(error)
    );
    return true;
  }
}
