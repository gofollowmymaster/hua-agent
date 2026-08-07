import type { PreviewDocumentItem } from './types';

const MIME_TYPES: Readonly<Record<string, string>> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain;charset=utf-8',
  md: 'text/markdown;charset=utf-8',
};

export function getPreviewMimeType(fileType = '') {
  return MIME_TYPES[fileType.toLowerCase()] ?? '';
}

export function isJsonBlob(blob: Blob) {
  return blob.type.includes('application/json');
}

export function toPreviewFile(source: Blob | File, item: PreviewDocumentItem) {
  if (isJsonBlob(source)) {
    throw new Error('Preview endpoint returned JSON');
  }
  if (source instanceof File) {
    return source;
  }
  return new File([source], item.fileName, {
    type: source.type || getPreviewMimeType(item.fileType),
  });
}
