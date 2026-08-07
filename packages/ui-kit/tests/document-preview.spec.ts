import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const destroy = vi.fn();
const createModal = vi.fn(() => ({ destroy }));

vi.mock('@aplus-frontend/ui', () => ({
  ApModal: { createModal },
}));

import {
  getPreviewMimeType,
  isJsonBlob,
  toPreviewFile,
} from '../src/components/document-preview/file';
import { useDocumentPreviewModal } from '../src/components/document-preview/use-document-preview-modal';

beforeEach(() => {
  createModal.mockClear();
  destroy.mockClear();
});

describe('document preview', () => {
  it('normalizes blobs and rejects JSON error payloads', () => {
    const file = toPreviewFile(new Blob(['pdf']), {
      fileName: 'demo.pdf',
      fileType: 'pdf',
    });

    expect(file.name).toBe('demo.pdf');
    expect(file.type).toBe('application/pdf');
    expect(getPreviewMimeType('DOCX')).toContain('wordprocessingml');
    expect(isJsonBlob(new Blob(['{}'], { type: 'application/json' }))).toBe(
      true,
    );
    expect(() =>
      toPreviewFile(new Blob(['{}'], { type: 'application/json' }), {
        fileName: 'error.json',
      }),
    ).toThrow('Preview endpoint returned JSON');
  });

  it('passes the injected loader to the modal and destroys it on unmount', () => {
    const loadFile = vi.fn(async () => new Blob(['pdf']));
    let modal: ReturnType<typeof useDocumentPreviewModal>;
    const wrapper = mount(
      defineComponent({
        setup() {
          modal = useDocumentPreviewModal({ loadFile });
          return () => h('div');
        },
      }),
    );

    modal!.open({ fileName: 'demo.pdf', fileType: 'pdf' });
    expect(createModal).toHaveBeenCalledOnce();
    const config = createModal.mock.calls[0][0];
    expect(config.title).toBe('demo.pdf');
    expect(config.content.props.loadFile).toBe(loadFile);

    wrapper.unmount();
    expect(destroy).toHaveBeenCalledOnce();
  });
});
