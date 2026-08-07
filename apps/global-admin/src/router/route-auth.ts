export interface GlobalAdminRouteUserStore {
  ensureLogin: () => Promise<unknown>;
  setLoginError: (message: string) => void;
}

/** 完成路由登录准备，并把认证错误交给已挂载的后台布局展示。 */
export async function prepareGlobalAdminRoute(
  userStore: GlobalAdminRouteUserStore
) {
  try {
    await userStore.ensureLogin();
  } catch (error) {
    userStore.setLoginError(
      error instanceof Error ? error.message : String(error)
    );
  }
}
