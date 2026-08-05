import { h, onUnmounted } from 'vue';
import { ApModal } from '@aplus-frontend/ui';
import DocumentPreviewContent from './index.vue';

export interface PreviewDocumentItem {
  id: string | number;
  fileName: string;
  fileType: string;
}

export function useDocumentPreviewModal() {
  let modal: ReturnType<typeof ApModal.createModal> | null = null;

  function open(item: PreviewDocumentItem) {
    modal?.destroy();
    modal = ApModal.createModal({
      title: item.fileName,
      width: '80vw',
      footer: null,
      wrapClassName: 'document-preview-modal',
      content: h(DocumentPreviewContent, { item }),
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
