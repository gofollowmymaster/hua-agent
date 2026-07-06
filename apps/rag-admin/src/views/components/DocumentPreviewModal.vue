<template>
  <ApModal
    v-model:open="open"
    :title="previewTitle"
    width="80vw"
    :footer="null"
    destroy-on-close
    wrap-class-name="document-preview-modal"
    @cancel="close"
  >
    <div class="document-preview-viewport">
      <div v-if="loading" class="preview-state">文件加载中...</div>
      <div v-else-if="errorText" class="preview-state error-text">{{ errorText }}</div>
      <OpenFileViewer
        v-else-if="previewFile"
        :file="previewFile"
        :file-name="previewFile.name"
        height="100%"
        fit="contain"
        theme="light"
        toolbar
        :plugins="viewerPlugins"
        @error="handlePreviewError"
        @unsupported="handlePreviewUnsupported"
      />
    </div>
  </ApModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ApModal } from '@aplus-frontend/ui';
import { OpenFileViewer } from '@open-file-viewer/vue';
import { imagePlugin, officePlugin, pdfPlugin, textPlugin } from '@open-file-viewer/core';
import '@open-file-viewer/core/style.css';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { getDocumentPreviewFile } from '@/api/rag-admin';

interface PreviewDocumentItem {
  id: string | number;
  fileName: string;
  fileType: string;
}

const open = ref(false);
const loading = ref(false);
const errorText = ref('');
const previewItem = ref<PreviewDocumentItem | null>(null);
const previewFile = ref<File | null>(null);
const viewerPlugins = [
  imagePlugin(),
  pdfPlugin({ workerSrc: pdfWorkerSrc, useFetchData: true }),
  officePlugin(),
  textPlugin(),
];
const previewTitle = computed(() => previewItem.value?.fileName || '文件预览');

async function show(item: PreviewDocumentItem) {
  open.value = true;
  loading.value = true;
  errorText.value = '';
  previewItem.value = item;
  previewFile.value = null;

  try {
    const blob = await getDocumentPreviewFile(item.id);
    if (isJsonBlob(blob)) {
      throw new Error('Preview endpoint returned JSON');
    }
    previewFile.value = new File([blob], item.fileName, {
      type: blob.type || getMimeType(item.fileType),
    });
  } catch (error) {
    console.error(error);
    errorText.value = '文件加载失败，请确认原始文件仍存在。';
  } finally {
    loading.value = false;
  }
}

function close() {
  previewFile.value = null;
  errorText.value = '';
  previewItem.value = null;
}

function handlePreviewError() {
  errorText.value = '文件预览失败，可以尝试下载原文件后查看。';
}

function handlePreviewUnsupported() {
  errorText.value = '当前文件格式暂不支持在线预览。';
}

function getMimeType(fileType: string) {
  const mimeTypes: Record<string, string> = {
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

  return mimeTypes[fileType.toLowerCase()] ?? '';
}

function isJsonBlob(blob: Blob) {
  return blob.type.includes('application/json');
}

defineExpose({ show });
</script>

<style>
.document-preview-modal .ant-modal {
  top: 16px;
  max-width: calc(100vw - 32px);
  padding-bottom: 16px;
}

.document-preview-modal .ant-modal-content {
  display: flex;
  max-height: calc(100vh - 32px);
  flex-direction: column;
}

.document-preview-modal .ant-modal-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.document-preview-viewport {
  height: min(72vh, calc(100vh - 132px));
  min-height: 360px;
  overflow: hidden;
  background: #f8fafc;
}

.document-preview-viewport .ofv-root,
.document-preview-viewport .ofv-host {
  height: 100%;
  min-height: 0;
}

.document-preview-viewport .ofv-viewport,
.document-preview-viewport .ofv-pdf {
  min-height: 0;
  overflow: auto;
}

.preview-state {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  color: #667386;
}
</style>
