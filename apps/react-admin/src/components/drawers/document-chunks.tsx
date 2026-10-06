import { useEffect, useState } from 'react';
import { Alert, Descriptions, Empty, List, Pagination, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import {
  getDocument,
  pageDocumentChunks,
  type RagDocumentChunkItem,
  type RagDocumentItem,
} from '@/api/knowledge/documents';
import {
  getAgentKnowledgeDocument,
  pageAgentKnowledgeDocumentChunks,
  type AgentKnowledgeChunkItem,
  type AgentKnowledgeDocumentItem,
} from '@/api/business-agent/knowledge';

interface DocumentChunksProps {
  id: string;
  source: 'rag' | 'agent';
}

export function DocumentChunks({ id, source }: DocumentChunksProps) {
  const [document, setDocument] = useState<
    RagDocumentItem | AgentKnowledgeDocumentItem
  >();
  const [chunks, setChunks] = useState<
    Array<RagDocumentChunkItem | AgentKnowledgeChunkItem>
  >([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(1);
  }, [id, source]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const documentRequest =
      source === 'rag' ? getDocument(id) : getAgentKnowledgeDocument(id);
    const chunksRequest =
      source === 'rag'
        ? pageDocumentChunks(id, { page, pageSize: 10 })
        : pageAgentKnowledgeDocumentChunks(id, { page, pageSize: 10 });
    void Promise.all([documentRequest, chunksRequest])
      .then(([item, result]) => {
        if (!active) return;
        setDocument(item);
        setChunks(result.list);
        setTotal(result.total);
      })
      .catch(() => active && setError('切片加载失败，请稍后重试。'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, page, source]);

  if (error) return <Alert type="error" showIcon message={error} />;
  return (
    <Spin spinning={loading}>
      {document && (
        <Descriptions size="small" column={1} bordered>
          <Descriptions.Item label="文件名">
            {document.fileName}
          </Descriptions.Item>
          <Descriptions.Item label="路径">
            {document.sourcePath}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={document.status === 'failed' ? 'error' : 'success'}>
              {document.status}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      )}
      <List
        style={{ marginTop: 16 }}
        dataSource={chunks}
        locale={{ emptyText: <Empty description="暂无切片" /> }}
        renderItem={(chunk) => (
          <List.Item>
            <List.Item.Meta
              title={`切片 ${chunk.chunkIndex + 1} · ${dayjs(chunk.createdAt).format('YYYY-MM-DD HH:mm')}`}
              description={
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {chunk.content}
                </pre>
              }
            />
          </List.Item>
        )}
      />
      {total > 10 && (
        <Pagination
          current={page}
          pageSize={10}
          total={total}
          showSizeChanger={false}
          onChange={setPage}
        />
      )}
    </Spin>
  );
}
