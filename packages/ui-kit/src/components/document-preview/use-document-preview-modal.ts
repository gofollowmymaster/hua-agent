import { h, onUnmounted } from 'vue';
import { ApModal } from '@aplus-frontend/ui';
import DocumentPreviewContent from './index.vue';
import type { LoadPreviewFile, PreviewDocumentItem } from './types';

export interface UseDocumentPreviewModalOptions<
  Item extends PreviewDocumentItem,
> {
  loadFile: LoadPreviewFile<Item>;
}

export function useDocumentPreviewModal<Item extends PreviewDocumentItem>(
  options: UseDocumentPreviewModalOptions<Item>,
) {
  let modal: ReturnType<typeof ApModal.createModal> | null = null;

  function open(item: Item) {
    modal?.destroy();
    modal = ApModal.createModal({
      title: item.fileName,
      width: '80vw',
      footer: null,
      wrapClassName: 'document-preview-modal',
      content: h(DocumentPreviewContent, {
        item,
        loadFile: options.loadFile as LoadPreviewFile<PreviewDocumentItem>,
      }),
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
