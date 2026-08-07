import { useGetDerivedNamespace, type AgGridProps } from '@aplus-frontend/ui';
import { h, hasInjectionContext } from 'vue';
import { useRouter, type RouteLocationRaw } from 'vue-router';

export const DETAIL_ACTION_CLASS = 'custom-details-action-btn';

const AG_GRID_POINTER_ROW_CLASS = 'ag-grid-row-grid-util-pointer';

export interface RowClickExtraParams {
  query?: Record<string, string>;
  params?: Record<string, string | number>;
  replace?: boolean;
}

export type RowClickPermission = (() => boolean) | boolean;
type EventType = Event | null | undefined;

const hasClassInChildren = (
  element: HTMLElement | null | undefined,
  className: string
): boolean => {
  if (!element) {
    return false;
  }
  if (element.classList?.contains(className)) {
    return true;
  }
  return Array.from(element.children).some((child) =>
    hasClassInChildren(child as HTMLElement, className)
  );
};

const transformAgGridRowClicked = <RecordType = any>(option: {
  rowClicked: NonNullable<AgGridProps<RecordType>['onRowClicked']>;
  auth?: boolean | (() => boolean);
  includeClassNameList?: string[];
  excludeClassNameList?: string[];
  actionItemClassName: string;
}) => {
  const includeClassNameList = [
    'ag-cell',
    'ag-cell-value',
    ...(option.includeClassNameList ?? [])
  ];
  const excludeClassNameList = [
    'ag-grid-summary-cell',
    ...(option.excludeClassNameList ?? [])
  ];

  const hasAuth = () =>
    typeof option.auth === 'function' ? option.auth() : (option.auth ?? true);

  const handleRowClicked = ((record, event) => {
    if (!hasAuth()) {
      return;
    }
    if ((window.getSelection()?.toString()?.length ?? 0) > 0) {
      return;
    }

    const target = event?.target as HTMLElement | undefined;
    const isInCell = includeClassNameList.some((className) =>
      Boolean(target?.closest?.(`.${className}`))
    );
    if (!isInCell) {
      return;
    }
    if (
      excludeClassNameList.some((className) =>
        target?.classList?.contains(className)
      )
    ) {
      return;
    }
    if (target?.closest('.ag-grid-summary-cell')) {
      return;
    }
    if (hasClassInChildren(target, option.actionItemClassName)) {
      return;
    }

    option.rowClicked(record, event);
  }) as NonNullable<AgGridProps<RecordType>['onRowClicked']> & {
    getPointerRowClassName: () => string;
  };

  handleRowClicked.getPointerRowClassName = () =>
    hasAuth() ? AG_GRID_POINTER_ROW_CLASS : '';

  return handleRowClicked;
};

/**
 * 行点击跳转详情 hook，统一处理路由存在性、扩展权限和 AgGrid 行点击拦截。
 */
export function useRowClickAction(routerName: string) {
  if (!hasInjectionContext()) {
    throw new Error('useRowClickAction 禁止在 setup 外使用');
  }

  const router = useRouter();
  const actionItemClassName = `${useGetDerivedNamespace().value}-action-item`;

  const resolveExpandAuth = (expandAuth?: RowClickPermission) =>
    typeof expandAuth === 'function'
      ? expandAuth()
      : typeof expandAuth === 'boolean'
        ? expandAuth
        : true;

  const routerHasPermission = (expandAuth?: RowClickPermission) =>
    router.hasRoute(routerName) && resolveExpandAuth(expandAuth);

  const onRowClick = (
    event: EventType,
    extraParams: RowClickExtraParams,
    expandAuth?: RowClickPermission
  ) => {
    const rowClick = transformAgGridRowClicked({
      rowClicked() {
        const { replace, ...routeExtraParams } = extraParams;
        const target: RouteLocationRaw = {
          name: routerName,
          ...routeExtraParams
        };
        const navigate = replace ? router.replace : router.push;
        void navigate(target).catch(() => undefined);
      },
      auth: () => routerHasPermission(expandAuth),
      includeClassNameList: [DETAIL_ACTION_CLASS],
      actionItemClassName
    });

    rowClick({}, event);
  };

  const clickAction = (options?: {
    text?: string;
    expandAuth?: RowClickPermission;
  }) => ({
    text: h(
      'span',
      {
        class: DETAIL_ACTION_CLASS
      },
      options?.text ?? '详情'
    ),
    visible: routerHasPermission(options?.expandAuth)
  });

  const getPointerRowClassName = (expandAuth?: RowClickPermission) =>
    routerHasPermission(expandAuth) ? AG_GRID_POINTER_ROW_CLASS : '';

  return {
    onRowClick,
    routerHasPermission,
    getPointerRowClassName,
    clickAction
  };
}

export default useRowClickAction;
