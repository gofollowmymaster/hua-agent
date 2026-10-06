import { useEffect, useState } from 'react';
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
import { toPreviewFile } from './file';

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
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !item || !host) return undefined;
    let disposed = false;
    let viewer: ReturnType<typeof createViewer> | undefined;
    setLoading(true);
    setError('');
    void loadFile(item)
      .then((blob) => {
        if (disposed) return;
        const file = toPreviewFile(blob, item);
        viewer = createViewer({
          container: host,
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
  }, [host, item, loadFile, open]);

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
        {loading && (
          <div className="document-preview-state">
            <Spin size="large" />
          </div>
        )}
        {error && (
          <div className="document-preview-state">
            <Alert type="error" showIcon title={error} />
          </div>
        )}
        <div
          ref={setHost}
          className="document-preview-host"
          hidden={Boolean(error)}
        />
      </div>
    </Modal>
  );
}
