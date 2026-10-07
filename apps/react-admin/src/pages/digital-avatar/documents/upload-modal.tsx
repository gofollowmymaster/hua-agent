import { useEffect, useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { App, Listy, Modal, Space, Upload, type UploadFile } from 'antd';
import {
  uploadDigitalAvatarDocuments,
  type DigitalAvatarUploadResult,
} from '@/api/digital-avatar/documents';
import { SemanticTag } from '@/components/semantic-tag';
import {
  MAX_UPLOAD_FILES,
  validateDigitalAvatarUploads,
} from './upload-validation';

export function DigitalAvatarUploadModal({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const { message } = App.useApp();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<DigitalAvatarUploadResult>();

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setResult(undefined);
    }
  }, [open]);

  async function submit() {
    const selected = files.flatMap((item) =>
      item.originFileObj ? [item.originFileObj as File] : [],
    );
    const error = validateDigitalAvatarUploads(selected);
    if (error) {
      message.error(error);
      return;
    }
    setUploading(true);
    try {
      const next = await uploadDigitalAvatarDocuments(selected);
      setResult(next);
      setFiles([]);
      onUploaded();
      if (next.failedFiles === 0 && next.duplicateFiles === 0) {
        message.success('文档上传并入库完成');
      } else {
        message.warning('文档处理完成，请查看逐文件结果');
      }
    } catch {
      message.error('文档上传失败，请稍后重试');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal
      title="添加数字分身文档"
      width={680}
      open={open}
      onCancel={onClose}
      onOk={submit}
      okText="开始上传"
      cancelText="关闭"
      confirmLoading={uploading}
      destroyOnHidden
    >
      <Upload.Dragger
        fileList={files}
        multiple
        maxCount={MAX_UPLOAD_FILES}
        accept=".txt,text/plain"
        beforeUpload={() => false}
        disabled={uploading}
        onChange={({ fileList }) => setFiles(fileList)}
        onRemove={() => !uploading}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p>点击或拖拽 TXT 文档到此处</p>
        <p className="ant-upload-hint">
          仅支持 UTF-8 TXT；最多 20 个，单个不超过 50MB
        </p>
      </Upload.Dragger>
      {result && (
        <div style={{ marginTop: 20 }}>
          <Space wrap>
            <span>处理 {result.totalFiles} 个文件</span>
            <SemanticTag tone="success">成功 {result.indexedFiles}</SemanticTag>
            <SemanticTag tone="warning">
              重复 {result.duplicateFiles}
            </SemanticTag>
            <SemanticTag tone="error">失败 {result.failedFiles}</SemanticTag>
          </Space>
          <Listy
            items={result.files}
            rowKey={(item) => `${item.fileName}-${item.status}`}
            styles={{
              root: { maxHeight: 280, marginTop: 12, overflow: 'auto' },
              item: {
                padding: '8px 0',
                borderBlockEnd: '1px solid var(--app-color-divider)',
              },
            }}
            itemRender={(item) => (
              <div style={{ width: '100%' }}>
                <strong>{item.fileName}</strong>
                <div className="muted">
                  {item.status === 'indexed'
                    ? `${item.chunks || 0} 个切片`
                    : item.duplicateOf
                      ? `与 ${item.duplicateOf.fileName} 内容重复`
                      : item.reason || '处理失败'}
                </div>
              </div>
            )}
          />
        </div>
      )}
    </Modal>
  );
}
