import { useGetDerivedNamespace } from '@aplus-frontend/ui';
import { h, hasInjectionContext } from 'vue';
import { useRouter, type RouteLocationRaw } from 'vue-router';
import {
  AG_GRID_POINTER_ROW_CLASS,
  transformAgGridRowClicked,
} from '@/utils/grid-util';

export const DETAIL_ACTION_CLASS = 'custom-details-action-btn';

type ExtraParamsType = {
  query?: Record<string, string>;
  params?: Record<string, string | number>;
  replace?: boolean;
};
type ExpandAuthType = (() => boolean) | boolean;
type EventType = Event | null | undefined;

/**
 * 行点击跳转详情 hook，统一处理路由存在性、扩展权限和 AgGrid 行点击拦截。
 */
export function useRowClickAction(routerName: string) {
  if (!hasInjectionContext()) {
    throw new Error('useRowClickAction 禁止在 setup 外使用');
  }

  const router = useRouter();
  const actionItemClassName = `${useGetDerivedNamespace().value}-action-item`;

  const resolveExpandAuth = (expandAuth?: ExpandAuthType) =>
    typeof expandAuth === 'function'
      ? expandAuth()
      : typeof expandAuth === 'boolean'
        ? expandAuth
        : true;

  const routerHasPermission = (expandAuth?: ExpandAuthType) =>
    router.hasRoute(routerName) && resolveExpandAuth(expandAuth);

  const onRowClick = (
    event: EventType,
    extraParams: ExtraParamsType,
    expandAuth?: ExpandAuthType,
  ) => {
    const rowClick = transformAgGridRowClicked({
      rowClicked() {
        const { replace, ...routeExtraParams } = extraParams;
        const target: RouteLocationRaw = {
          name: routerName,
          ...routeExtraParams,
        };
        const navigate = replace ? router.replace : router.push;
        void navigate(target).catch(() => undefined);
      },
      auth: () => routerHasPermission(expandAuth),
      includeClassNameList: [DETAIL_ACTION_CLASS],
      actionItemClassName,
    });

    rowClick({}, event);
  };

  const clickAction = (options?: {
    text?: string;
    expandAuth?: ExpandAuthType;
  }) => ({
    text: h(
      'span',
      {
        class: DETAIL_ACTION_CLASS,
      },
      options?.text ?? '详情',
    ),
    visible: routerHasPermission(options?.expandAuth),
  });

  const getPointerRowClassName = (expandAuth?: ExpandAuthType) =>
    routerHasPermission(expandAuth) ? AG_GRID_POINTER_ROW_CLASS : '';

  return {
    onRowClick,
    routerHasPermission,
    getPointerRowClassName,
    clickAction,
  };
}

export default useRowClickAction;
