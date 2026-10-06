export const MAX_UPLOAD_FILES = 20;
export const MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.md',
];

export function validateUploadFiles(files: File[]) {
  if (files.length === 0) return '请选择需要上传的文件';
  if (files.length > MAX_UPLOAD_FILES)
    return `单次最多上传 ${MAX_UPLOAD_FILES} 个文件`;
  for (const file of files) {
    if (file.size > MAX_UPLOAD_FILE_SIZE) return `${file.name} 超过 50MB`;
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension))
      return `${file.name} 的格式不受支持`;
  }
  return '';
}
