<template>
  <div class="upload-modal-content">
    <Upload.Dragger
      v-model:file-list="fileList"
      name="files"
      multiple
      :max-count="MAX_FILES"
      :accept="ACCEPTED_EXTENSIONS.join(',')"
      :before-upload="beforeUpload"
      :disabled="uploading"
      @remove="removeFile"
    >
      <p class="upload-title">点击或拖拽文件到此处</p>
      <p class="upload-hint">
        支持 PDF、DOCX、XLSX、PPT、PPTX、TXT、MD；最多
        {{ MAX_FILES }} 个，单个不超过 50MB
      </p>
    </Upload.Dragger>

    <section v-if="result" class="upload-result">
      <header class="upload-result-summary">
        <span>处理 {{ result.totalFiles }} 个文件</span>
        <Space size="small" wrap>
          <ApTag :text="`成功 ${result.indexedFiles}`" color="#12b76a" />
          <ApTag :text="`重复 ${result.duplicateFiles}`" color="#f79009" />
          <ApTag :text="`失败 ${result.failedFiles}`" color="#f04438" />
        </Space>
      </header>

      <div class="upload-result-list">
        <article
          v-for="(item, index) in result.files"
          :key="`${item.fileName}-${index}`"
        >
          <div class="upload-result-row">
            <span class="upload-file-name">{{ item.fileName }}</span>
            <ApTag
              class="upload-status-tag"
              :text="statusText(item.status)"
              :color="statusColor(item.status)"
            />
          </div>
          <p v-if="item.status === 'indexed'" class="upload-result-detail">
            {{ item.chunks ?? 0 }} 个切片<span v-if="item.sourcePath">
              · {{ item.sourcePath }}</span
            >
          </p>
          <p v-else class="upload-result-detail">
            {{ duplicateMessage(item) || item.reason || '处理失败' }}
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Space, Upload, message } from '@aplus-frontend/antdv';
import type { UploadFile } from '@aplus-frontend/antdv';
import { ApTag } from '@aplus-frontend/ui';
import {
  uploadDocuments,
  type RagDocumentUploadFileResult,
  type RagDocumentUploadResult,
} from '@/api/rag-admin';

const MAX_FILES = 20;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.md',
];

const emit = defineEmits<{ uploaded: [] }>();
const uploading = ref(false);
const fileList = ref<UploadFile[]>([]);
const result = ref<RagDocumentUploadResult | null>(null);
const selectedFiles = computed<File[]>(() =>
  fileList.value.flatMap((item) =>
    item.originFileObj ? [item.originFileObj as File] : [],
  ),
);

function beforeUpload() {
  return false;
}

function removeFile() {
  return !uploading.value;
}

async function submit() {
  const files = selectedFiles.value;
  const validationError = validateFiles(files);
  if (validationError) {
    message.error(validationError);
    return false;
  }

  uploading.value = true;
  result.value = null;
  try {
    result.value = await uploadDocuments(files);
    fileList.value = [];
    emit('uploaded');
    if (result.value.failedFiles === 0 && result.value.duplicateFiles === 0) {
      message.success('文档上传并索引完成');
    } else {
      message.warning('文档处理完成，请查看逐文件结果');
    }
    return true;
  } catch {
    message.error('文档上传失败，请稍后重试');
    return false;
  } finally {
    uploading.value = false;
  }
}

function validateFiles(files: File[]) {
  if (files.length === 0) return '请选择需要上传的文件';
  if (files.length > MAX_FILES) return `单次最多上传 ${MAX_FILES} 个文件`;

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) return `${file.name} 超过 50MB`;
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension))
      return `${file.name} 的格式不受支持`;
  }
  return '';
}

function duplicateMessage(item: RagDocumentUploadFileResult) {
  return item.duplicateOf ? `与 ${item.duplicateOf.fileName} 内容重复` : '';
}

function statusText(status: RagDocumentUploadFileResult['status']) {
  return { indexed: '已索引', duplicate: '重复', failed: '失败' }[status];
}

function statusColor(status: RagDocumentUploadFileResult['status']) {
  return { indexed: '#12b76a', duplicate: '#f79009', failed: '#f04438' }[
    status
  ];
}

defineExpose({ submit });
</script>

<style scoped>
.upload-modal-content {
  padding-top: 4px;
}

.upload-title {
  margin: 8px 0 4px;
  color: #101828;
  font-size: 15px;
  font-weight: 600;
}

.upload-hint {
  max-width: 520px;
  margin: 0 auto;
  color: #667085;
  font-size: 13px;
  line-height: 20px;
}

.upload-result {
  margin-top: 20px;
  border-top: 1px solid #eaecf0;
  padding-top: 16px;
}

.upload-result-summary,
.upload-result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.upload-result-summary {
  margin-bottom: 12px;
  color: #344054;
  font-weight: 600;
}

.upload-result-list {
  max-height: 280px;
  overflow: auto;
  border: 1px solid #eaecf0;
  border-radius: 8px;
}

.upload-result-list article {
  padding: 10px 12px;
}

.upload-result-list article + article {
  border-top: 1px solid #eaecf0;
}

.upload-file-name {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  color: #344054;
  font-weight: 600;
}

.upload-status-tag {
  flex: 0 0 auto;
}

.upload-result-detail {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  color: #667085;
  font-size: 12px;
  line-height: 18px;
}

@media (max-width: 640px) {
  .upload-result-summary {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
