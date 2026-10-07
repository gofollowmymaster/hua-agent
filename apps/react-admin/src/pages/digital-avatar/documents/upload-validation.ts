export const MAX_UPLOAD_FILES = 20;
export const MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024;

export function validateDigitalAvatarUploads(files: File[]) {
  if (files.length === 0) return '请选择需要上传的 TXT 文档';
  if (files.length > MAX_UPLOAD_FILES)
    return `单次最多上传 ${MAX_UPLOAD_FILES} 个文件`;
  for (const file of files) {
    if (file.size > MAX_UPLOAD_FILE_SIZE) return `${file.name} 超过 50MB`;
    if (!file.name.toLowerCase().endsWith('.txt'))
      return `${file.name} 不是 TXT 文档`;
  }
  return '';
}
