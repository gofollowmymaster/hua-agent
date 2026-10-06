import { describe, expect, it } from 'vitest';
import { MAX_UPLOAD_FILE_SIZE, validateUploadFiles } from './upload-validation';

describe('validateUploadFiles', () => {
  it('accepts supported files and rejects invalid selections', () => {
    expect(validateUploadFiles([new File(['a'], 'a.pdf')])).toBe('');
    expect(validateUploadFiles([])).toContain('请选择');
    expect(validateUploadFiles([new File(['a'], 'a.exe')])).toContain(
      '格式不受支持',
    );
    const large = new File(['a'], 'large.pdf');
    Object.defineProperty(large, 'size', { value: MAX_UPLOAD_FILE_SIZE + 1 });
    expect(validateUploadFiles([large])).toContain('超过 50MB');
  });
});
