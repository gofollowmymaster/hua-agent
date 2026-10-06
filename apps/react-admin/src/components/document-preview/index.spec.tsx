import { render, screen, waitFor } from '@testing-library/react';
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

  it('shows viewer errors above the preview host', async () => {
    viewerMocks.createViewer.mockImplementation((options) => {
      options.onError?.(new Error('render failed'), options.file);
      return { destroy: viewerMocks.destroy };
    });
    const loadFile = vi
      .fn()
      .mockResolvedValue(new Blob(['# preview'], { type: 'text/markdown' }));

    render(
      <DocumentPreviewModal
        open
        item={{ id: 1, fileName: 'preview.md', fileType: 'md' }}
        onClose={vi.fn()}
        loadFile={loadFile}
      />,
    );

    expect(
      await screen.findByText('文件预览失败，可以尝试下载原文件后查看。'),
    ).toBeInTheDocument();
    expect(document.querySelector('.document-preview-host')).toHaveAttribute(
      'hidden',
    );
  });
});
