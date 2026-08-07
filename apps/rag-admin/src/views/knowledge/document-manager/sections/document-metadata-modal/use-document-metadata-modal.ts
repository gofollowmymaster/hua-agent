import { h, onUnmounted } from 'vue';
import { message } from '@aplus-frontend/antdv';
import { ApModal } from '@aplus-frontend/ui';
import {
  updateDocumentMetadata,
  type RagDocumentItem,
} from '@/api/rag-admin';
import DocumentMetadataForm from './index.vue';

export function useDocumentMetadataModal(options?: {
  onSaved?: () => void;
}) {
  let modal: ReturnType<typeof ApModal.createModal> | null = null;

  function open(item: RagDocumentItem) {
    modal?.destroy();
    modal = ApModal.createModal<{
      getForm: () => { type: string; tag: string };
    }>({
      title: '编辑文档元数据',
      width: 480,
      content: h(DocumentMetadataForm, { item }),
      onOk: async (contentExposed) => {
        const form =
          contentExposed?.getForm?.() ?? { type: '', tag: '' };
        await updateDocumentMetadata(item.id, form);
        message.success('文档元数据已更新');
        options?.onSaved?.();
        return true;
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
