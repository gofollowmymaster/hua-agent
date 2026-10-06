import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Spin } from 'antd';
import {
  createViewer,
  imagePlugin,
  officePlugin,
  pdfPlugin,
  textPlugin,
} from '@open-file-viewer/core';
import '@open-file-viewer/core/style.css';
import './style.css';

export interface PreviewDocumentItem {
  id: string | number;
  fileName: string;
  fileType?: string;
}

interface DocumentPreviewModalProps<T extends PreviewDocumentItem> {
  item?: T;
  open: boolean;
  onClose: () => void;
  loadFile: (item: T) => Promise<Blob>;
}

export function DocumentPreviewModal<T extends PreviewDocumentItem>({
  item,
  open,
  onClose,
  loadFile,
}: DocumentPreviewModalProps<T>) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !item || !hostRef.current) return undefined;
    let disposed = false;
    let viewer: ReturnType<typeof createViewer> | undefined;
    const host = hostRef.current;
    setLoading(true);
    setError('');
    void loadFile(item)
      .then((blob) => {
        if (disposed || !hostRef.current) return;
        const file = new File([blob], item.fileName, { type: blob.type });
        viewer = createViewer({
          container: hostRef.current,
          file,
          fileName: item.fileName,
          height: '100%',
          fit: 'contain',
          theme: 'light',
          toolbar: true,
          plugins: [
            imagePlugin(),
            pdfPlugin({
              workerSrc: new URL(
                'pdfjs-dist/build/pdf.worker.mjs',
                import.meta.url,
              ).toString(),
              useFetchData: true,
            }),
            officePlugin(),
            textPlugin(),
          ],
          onError: () => setError('文件预览失败，可以尝试下载原文件后查看。'),
          onUnsupported: () => setError('当前文件格式暂不支持在线预览。'),
        });
      })
      .catch(() => setError('文件加载失败，请确认原始文件仍存在。'))
      .finally(() => {
        if (!disposed) setLoading(false);
      });
    return () => {
      disposed = true;
      viewer?.destroy();
      host.replaceChildren();
    };
  }, [item, loadFile, open]);

  return (
    <Modal
      title={item?.fileName || '文件预览'}
      open={open}
      onCancel={onClose}
      footer={null}
      width="min(1120px, calc(100vw - 32px))"
      destroyOnHidden
    >
      <div className="document-preview-viewport">
        {loading && <Spin size="large" />}
        {error && <Alert type="error" showIcon message={error} />}
        <div ref={hostRef} className="document-preview-host" />
      </div>
    </Modal>
  );
}
