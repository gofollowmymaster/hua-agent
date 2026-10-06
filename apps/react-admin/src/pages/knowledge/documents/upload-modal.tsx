import { useEffect, useState } from 'react';
import { App, Listy, Modal, Space, Upload, type UploadFile } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import {
  uploadDocuments,
  type RagDocumentUploadResult,
} from '@/api/knowledge/documents';
import {
  ACCEPTED_EXTENSIONS,
  MAX_UPLOAD_FILES,
  validateUploadFiles,
} from './upload-validation';
import { SemanticTag } from '@/components/semantic-tag';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export function DocumentUploadModal({
  open,
  onClose,
  onUploaded,
}: UploadModalProps) {
  const { message } = App.useApp();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<RagDocumentUploadResult>();
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
    const error = validateUploadFiles(selected);
    if (error) {
      message.error(error);
      return;
    }
    setUploading(true);
    try {
      const next = await uploadDocuments(selected);
      setResult(next);
      setFiles([]);
      onUploaded();
      if (next.failedFiles === 0 && next.duplicateFiles === 0) {
        message.success('文档上传并索引完成');
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
      title="添加文档"
      width={680}
      open={open}
      onCancel={onClose}
      onOk={submit}
      okText="开始上传"
      cancelText="关闭"
      confirmLoading={uploading}
    >
      <Upload.Dragger
        fileList={files}
        multiple
        maxCount={MAX_UPLOAD_FILES}
        accept={ACCEPTED_EXTENSIONS.join(',')}
        beforeUpload={() => false}
        disabled={uploading}
        onChange={({ fileList }) => setFiles(fileList)}
        onRemove={() => !uploading}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p>点击或拖拽文件到此处</p>
        <p className="ant-upload-hint">
          支持 PDF、DOCX、XLSX、PPT、PPTX、TXT、MD；最多 20 个，单个不超过 50MB
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
            rowKey={(item) => item.fileName}
            styles={{
              root: {
                maxHeight: 280,
                marginTop: 12,
                overflow: 'auto',
                border: '1px solid var(--app-color-border)',
                borderRadius: 6,
              },
              item: {
                padding: '8px 12px',
                borderBlockEnd: '1px solid var(--app-color-divider)',
              },
            }}
            itemRender={(item) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: 8,
                }}
              >
                <div>
                  <h4 style={{ margin: 0 }}>{item.fileName}</h4>
                  <div className="muted">
                    {item.status === 'indexed'
                      ? `${item.chunks || 0} 个切片${item.sourcePath ? ` · ${item.sourcePath}` : ''}`
                      : item.duplicateOf
                        ? `与 ${item.duplicateOf.fileName} 内容重复`
                        : item.reason || '处理失败'}
                  </div>
                </div>
                <SemanticTag
                  tone={
                    item.status === 'indexed'
                      ? 'success'
                      : item.status === 'duplicate'
                        ? 'warning'
                        : 'error'
                  }
                >
                  {item.status === 'indexed'
                    ? '已索引'
                    : item.status === 'duplicate'
                      ? '重复'
                      : '失败'}
                </SemanticTag>
              </div>
            )}
          />
        </div>
      )}
    </Modal>
  );
}
