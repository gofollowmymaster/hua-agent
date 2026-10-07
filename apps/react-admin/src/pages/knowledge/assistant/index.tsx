import { useMemo, useState } from 'react';
import { useModel } from '@umijs/max';
import { ChatWorkspace } from '@aplus-sql/react-ui-kit';
import {
  DocumentPreviewModal,
  type PreviewDocumentItem,
} from '@/components/document-preview';
import { getDocumentPreviewFile } from '@/api/knowledge/documents';
import { createRagChatAdapter } from './adapter';

export default function AssistantPage() {
  const auth = useModel('auth');
  const adapter = useMemo(createRagChatAdapter, []);
  const [preview, setPreview] = useState<PreviewDocumentItem>();
  const participantId =
    auth.userInfo.userId || auth.userInfo.email || auth.displayName;
  return (
    <>
      <ChatWorkspace
        adapter={adapter}
        participantId={participantId}
        emptyDescription="助手会检索当前 RAG 文档并以流式方式返回答案。"
        onPreview={setPreview}
      />
      <DocumentPreviewModal
        open={Boolean(preview)}
        item={preview}
        onClose={() => setPreview(undefined)}
        loadFile={(item) => getDocumentPreviewFile(item.id)}
      />
    </>
  );
}
