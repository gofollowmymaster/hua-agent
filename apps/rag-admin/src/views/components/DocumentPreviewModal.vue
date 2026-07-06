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
    <div v-if="loading" class="preview-state">文件加载中...</div>
    <div v-else-if="errorText" class="preview-state error-text">{{ errorText }}</div>
    <OpenFileViewer
      v-else-if="previewFile"
      :file="previewFile"
      :file-name="previewFile.name"
      height="70vh"
      fit="contain"
      theme="light"
      toolbar
      :plugins="viewerPlugins"
      @error="handlePreviewError"
      @unsupported="handlePreviewUnsupported"
    />
  </ApModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ApModal } from '@aplus-frontend/ui';
import { OpenFileViewer } from '@open-file-viewer/vue';
import { imagePlugin, officePlugin, pdfPlugin, textPlugin } from '@open-file-viewer/core';
import '@open-file-viewer/core/style.css';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { getDocumentPreviewFile, type RagDocumentItem } from '@/api/rag-admin';

const open = ref(false);
const loading = ref(false);
const errorText = ref('');
const previewItem = ref<RagDocumentItem | null>(null);
const previewFile = ref<File | null>(null);
const viewerPlugins = [
  imagePlugin(),
  pdfPlugin({ workerSrc: pdfWorkerSrc, useFetchData: true }),
  officePlugin(),
  textPlugin(),
];
const previewTitle = computed(() => previewItem.value?.fileName || '文件预览');

async function show(item: RagDocumentItem) {
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
