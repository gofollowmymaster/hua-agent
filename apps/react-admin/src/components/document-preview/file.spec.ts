import { describe, expect, it } from 'vitest';
import { getPreviewMimeType, toPreviewFile } from './file';

describe('document preview file normalization', () => {
  it('supplies the Markdown MIME type when the response omits it', () => {
    const file = toPreviewFile(new Blob(['# preview']), {
      id: 1,
      fileName: 'preview.md',
      fileType: 'md',
    });

    expect(file.type).toBe('text/markdown;charset=utf-8');
    expect(getPreviewMimeType('MD')).toBe('text/markdown;charset=utf-8');
  });

  it('rejects JSON error payloads returned as blobs', () => {
    expect(() =>
      toPreviewFile(new Blob(['{}'], { type: 'application/json' }), {
        id: 1,
        fileName: 'preview.md',
        fileType: 'md',
      }),
    ).toThrow('Preview endpoint returned JSON');
  });
});
