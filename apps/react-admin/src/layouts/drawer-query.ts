import { history, useLocation } from '@umijs/max';

export type DrawerKey =
  'document-chunks' | 'session-messages' | 'agent-knowledge-chunks';

export function readDrawerQuery(search: string) {
  const params = new URLSearchParams(search);
  return {
    drawer: params.get('drawer') as DrawerKey | null,
    drawerCode: params.get('drawerCode') || '',
  };
}

export function updateDrawerQuery(
  search: string,
  next?: { drawer: DrawerKey; drawerCode: string | number },
) {
  const params = new URLSearchParams(search);
  if (next) {
    params.set('drawer', next.drawer);
    params.set('drawerCode', String(next.drawerCode));
  } else {
    params.delete('drawer');
    params.delete('drawerCode');
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function useDrawerQuery() {
  const location = useLocation();
  return {
    ...readDrawerQuery(location.search),
    open(drawer: DrawerKey, drawerCode: string | number) {
      history.push({
        pathname: location.pathname,
        search: updateDrawerQuery(location.search, { drawer, drawerCode }),
      });
    },
    close() {
      history.replace({
        pathname: location.pathname,
        search: updateDrawerQuery(location.search),
      });
    },
  };
}
