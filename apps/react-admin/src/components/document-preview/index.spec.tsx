import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DocumentPreviewModal } from '.';

const viewerMocks = vi.hoisted(() => ({
  createViewer: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock('@open-file-viewer/core', () => ({
  createViewer: viewerMocks.createViewer,
  imagePlugin: () => ({}),
  officePlugin: () => ({}),
  pdfPlugin: () => ({}),
  textPlugin: () => ({}),
}));

describe('DocumentPreviewModal', () => {
  it('destroys the viewer when the file changes and on unmount', async () => {
    viewerMocks.createViewer.mockImplementation(() => ({
      destroy: viewerMocks.destroy,
    }));
    const loadFile = vi
      .fn()
      .mockResolvedValue(new Blob(['preview'], { type: 'text/plain' }));
    const first = { id: 1, fileName: 'first.txt', fileType: 'txt' };
    const second = { id: 2, fileName: 'second.txt', fileType: 'txt' };
    const view = render(
      <DocumentPreviewModal
        open
        item={first}
        onClose={vi.fn()}
        loadFile={loadFile}
      />,
    );

    await waitFor(() =>
      expect(viewerMocks.createViewer).toHaveBeenCalledTimes(1),
    );
    view.rerender(
      <DocumentPreviewModal
        open
        item={second}
        onClose={vi.fn()}
        loadFile={loadFile}
      />,
    );
    await waitFor(() =>
      expect(viewerMocks.createViewer).toHaveBeenCalledTimes(2),
    );
    expect(viewerMocks.destroy).toHaveBeenCalledTimes(1);

    view.unmount();
    expect(viewerMocks.destroy).toHaveBeenCalledTimes(2);
  });
});
