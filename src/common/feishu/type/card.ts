export type CardReturnType<T> = {
  type: 'template' | 'raw';
  data: {
    template_id: string;
    template_version_name: string;
    template_variable: T;
  };
};
export type ToastReturnType = {
  type: 'info' | 'success' | 'error' | 'warning';
  content: string;
  i18n: Record<string, string>;
};
export type CardCallbackReturnType<T> = {
  toast?: ToastReturnType;
  card?: CardReturnType<T>;
};
