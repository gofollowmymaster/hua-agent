export interface RagAdminRouteUserStore {
  ensureLogin: () => Promise<unknown>;
  setLoginError: (message: string) => void;
  logout: () => void;
}

/** 完成路由登录准备；无 token 时清理登录态并阻止进入后台壳。 */
export async function prepareRagAdminRoute(
  userStore: RagAdminRouteUserStore
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
    return false;
  }
}
