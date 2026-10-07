import { describe, expect, it } from 'vitest';
import { validateDigitalAvatarUploads } from './upload-validation';

describe('validateDigitalAvatarUploads', () => {
  it('accepts txt and rejects other formats', () => {
    expect(
      validateDigitalAvatarUploads([
        new File(['content'], '课程.txt', { type: 'text/plain' }),
      ]),
    ).toBe('');
    expect(
      validateDigitalAvatarUploads([
        new File(['content'], '课程.md', { type: 'text/markdown' }),
      ]),
    ).toContain('不是 TXT');
  });

  it('requires at least one file', () => {
    expect(validateDigitalAvatarUploads([])).toContain('请选择');
  });
});
