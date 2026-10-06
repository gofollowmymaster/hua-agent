import { describe, expect, it } from 'vitest';
import { resolvePreviewDocument, toRagUiMessages } from './adapter';

describe('rag chat adapter', () => {
  it('maps user and assistant history only', () => {
    const result = toRagUiMessages([
      { id: 1, role: 'system', content: 'hidden', createdAt: '' },
      { id: 2, role: 'assistant', content: 'answer', createdAt: '' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].parts).toEqual([{ type: 'text', text: 'answer' }]);
  });

  it('resolves only internal preview links', () => {
    expect(
      resolvePreviewDocument(
        '/api/ai/rag/admin/documents/12/preview',
        '合同.pdf',
      ),
    ).toEqual({ id: '12', fileName: '合同.pdf', fileType: 'pdf' });
    expect(resolvePreviewDocument('https://example.com', '外链')).toBeNull();
  });
});
