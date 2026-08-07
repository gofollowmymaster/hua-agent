<template>
  <div class="document-preview-viewport">
    <div v-if="loading" class="preview-state">文件加载中...</div>
    <div v-else-if="errorText" class="preview-state error-text">
      {{ errorText }}
    </div>
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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { OpenFileViewer } from '@open-file-viewer/vue';
import {
  imagePlugin,
  officePlugin,
  pdfPlugin,
  textPlugin,
} from '@open-file-viewer/core';
import '@open-file-viewer/core/style.css';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { toPreviewFile } from './file';
import type { LoadPreviewFile, PreviewDocumentItem } from './types';

const props = defineProps<{
  item: PreviewDocumentItem;
  loadFile: LoadPreviewFile<PreviewDocumentItem>;
}>();

const loading = ref(false);
const errorText = ref('');
const previewFile = ref<File | null>(null);
const viewerPlugins = [
  imagePlugin(),
  pdfPlugin({ workerSrc: pdfWorkerSrc, useFetchData: true }),
  officePlugin(),
  textPlugin(),
];

watch(
  () => props.item,
  () => {
    void loadPreview();
  },
  {
    immediate: true,
  },
);

async function loadPreview() {
  loading.value = true;
  errorText.value = '';
  previewFile.value = null;

  try {
    const source = await props.loadFile(props.item);
    previewFile.value = toPreviewFile(source, props.item);
  } catch (error) {
    console.error(error);
    errorText.value = '文件加载失败，请确认原始文件仍存在。';
  } finally {
    loading.value = false;
  }
}

function handlePreviewError() {
  errorText.value = '文件预览失败，可以尝试下载原文件后查看。';
}

function handlePreviewUnsupported() {
  errorText.value = '当前文件格式暂不支持在线预览。';
}

</script>

<style lang="less">
.document-preview-modal .ant-modal {
  top: 16px;
  max-width: calc(100vw - 32px);
  padding-bottom: 16px;
}

.document-preview-modal .ant-modal-content {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 32px);
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
  background: @fill-bg-color;
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
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: @text-secondary-color;
}
</style>
