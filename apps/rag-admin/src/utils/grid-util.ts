import type { AgGridProps } from '@aplus-frontend/ui';

export const AG_GRID_POINTER_ROW_CLASS = 'ag-grid-row-grid-util-pointer';

const DEFAULT_ACTION_ITEM_CLASS = 'aplus-action-item';

const hasClassInChildren = (
  element: HTMLElement | null | undefined,
  className: string,
): boolean => {
  if (!element) {
    return false;
  }
  if (element.classList?.contains(className)) {
    return true;
  }
  return Array.from(element.children).some((child) =>
    hasClassInChildren(child as HTMLElement, className),
  );
};

/**
 * 统一处理 AgGrid 行点击，拦截无权限、文本选择、非单元格、汇总行和操作列点击。
 */
export const transformAgGridRowClicked = <RecordType = any>(option: {
  rowClicked: NonNullable<AgGridProps<RecordType>['onRowClicked']>;
  auth?: boolean | (() => boolean);
  includeClassNameList?: string[];
  excludeClassNameList?: string[];
  actionItemClassName?: string;
}) => {
  const includeClassNameList = [
    'ag-cell',
    'ag-cell-value',
    ...(option.includeClassNameList ?? []),
  ];
  const excludeClassNameList = [
    'ag-grid-summary-cell',
    ...(option.excludeClassNameList ?? []),
  ];
  const actionItemClassName =
    option.actionItemClassName ?? DEFAULT_ACTION_ITEM_CLASS;
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
    if (
      includeClassNameList.every(
        (className) => !target?.classList?.contains(className),
      )
    ) {
      return;
    }
    if (
      excludeClassNameList.some((className) =>
        target?.classList?.contains(className),
      )
    ) {
      return;
    }
    if (target?.closest('.ag-grid-summary-cell')) {
      return;
    }
    if (hasClassInChildren(target, actionItemClassName)) {
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
