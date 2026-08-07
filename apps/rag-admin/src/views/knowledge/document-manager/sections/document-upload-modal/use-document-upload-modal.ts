import { h, onUnmounted } from 'vue';
import { ApModal } from '@aplus-frontend/ui';
import DocumentUploadContent from './index.vue';

export function useDocumentUploadModal(options?: {
  onUploaded?: () => void;
}) {
  let modal: ReturnType<typeof ApModal.createModal> | null = null;

  function open() {
    modal?.destroy();
    modal = ApModal.createModal<{
      submit: () => Promise<boolean>;
    }>({
      title: '添加文档',
      width: 680,
      okText: '开始上传',
      cancelText: '关闭',
      content: h(DocumentUploadContent, {
        onUploaded: options?.onUploaded,
      }),
      onOk: async (contentExposed) => {
        return contentExposed.submit();
      },
    });
  }

  function destroy() {
    modal?.destroy();
    modal = null;
  }

  onUnmounted(destroy);

  return {
    open,
    destroy,
  };
}
