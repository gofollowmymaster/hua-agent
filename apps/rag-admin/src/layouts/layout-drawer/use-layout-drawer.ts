import { useRoute, useRouter } from 'vue-router';
import type { DrawerKey } from './component-map';

type DrawerParams = Record<string, string | number>;

export function useLayoutDrawer() {
  const route = useRoute();
  const router = useRouter();

  function open(
    key: DrawerKey,
    params: DrawerParams = {},
    options?: {
      replace?: boolean;
    },
  ) {
    const query = {
      ...route.query,
      drawer: key,
      ...params,
    };

    if (options?.replace) {
      void router.replace({ query });
    } else {
      void router.push({ query });
    }
  }

  function close() {
    const query = { ...route.query };
    delete query.drawer;
    delete query.drawerCode;
    void router.replace({ query });
  }

  return {
    open,
    close,
  };
}
