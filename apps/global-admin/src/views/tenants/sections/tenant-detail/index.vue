<template>
  <section class="tenant-detail">
    <header class="detail-header">
      <div>
        <div class="detail-title">{{ detail?.displayName || '租户详情' }}</div>
        <div v-if="detail" class="detail-code">{{ detail.tenantCode }}</div>
      </div>
      <ApButton type="text" @click="close">关闭</ApButton>
    </header>

    <div class="detail-body">
      <Spin :spinning="loading">
        <Alert
          v-if="errorMessage"
          type="error"
          show-icon
          message="租户详情加载失败"
          :description="errorMessage"
        >
          <template #action>
            <ApButton size="small" @click="load">重试</ApButton>
          </template>
        </Alert>
        <ApDescriptions
          v-else-if="detailView"
          :schemas="schemas"
          :data-source="detailView"
          :column="1"
          bordered
        />
      </Spin>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, h, onMounted, ref, watch } from 'vue';
  import { Alert, Spin } from '@aplus-frontend/antdv';
  import {
    ApButton,
    ApDescriptions,
    ApTag,
    type DescriptionsItemSchema
  } from '@aplus-frontend/ui';
  import { getTenant, type GlobalAdminTenantDetail } from '@/api/global-admin';
  import { ThemeColor } from '@/config/theme-color-token';
  import { useLayoutDrawer } from '@/layouts/layout-drawer/use-layout-drawer';

  const props = defineProps<{ drawerCode: string }>();
  const layoutDrawer = useLayoutDrawer();
  const loading = ref(false);
  const errorMessage = ref('');
  const detail = ref<GlobalAdminTenantDetail>();
  const detailView = computed(() =>
    detail.value
      ? {
          ...detail.value,
          wiki: detail.value.capabilities.wiki,
          auth: detail.value.capabilities.auth,
          aily: detail.value.capabilities.aily,
          wecomBot: detail.value.capabilities.wecomBot
        }
      : undefined
  );
  type DetailView = NonNullable<typeof detailView.value>;

  const capabilityTag = (value: boolean) =>
    h(ApTag, {
      text: value ? '已配置' : '未配置',
      color: value ? ThemeColor.Green : ThemeColor.TextTertiary
    });
  const schemas: DescriptionsItemSchema<DetailView>[] = [
    {
      label: '服务商编码',
      field: 'supplierCode',
      valueType: 'text',
      span: 3
    },
    {
      label: '租户编码',
      field: 'tenantCode',
      valueType: 'text',
      span: 3
    },
    {
      label: '租户名称',
      field: 'displayName',
      valueType: 'text',
      span: 3
    },
    {
      label: '域名标记',
      field: 'hostTag',
      valueType: 'text',
      span: 3
    },
    {
      label: 'Wiki',
      field: 'wiki',
      valueType: 'text',
      span: 3,
      customRender: (record) => capabilityTag(Boolean(record?.wiki))
    },
    {
      label: '认证能力',
      field: 'auth',
      valueType: 'text',
      span: 3,
      customRender: (record) => capabilityTag(Boolean(record?.auth))
    },
    {
      label: 'Aily',
      field: 'aily',
      valueType: 'text',
      span: 3,
      customRender: (record) => capabilityTag(Boolean(record?.aily))
    },
    {
      label: '企微机器人',
      field: 'wecomBot',
      valueType: 'text',
      span: 3,
      customRender: (record) => capabilityTag(Boolean(record?.wecomBot))
    }
  ];

  async function load() {
    loading.value = true;
    errorMessage.value = '';
    try {
      detail.value = await getTenant(props.drawerCode);
    } catch (error) {
      detail.value = undefined;
      errorMessage.value =
        error instanceof Error ? error.message : String(error);
    } finally {
      loading.value = false;
    }
  }

  function close() {
    layoutDrawer.close();
  }

  watch(() => props.drawerCode, load);
  onMounted(load);
</script>

<style lang="less" scoped>
  .tenant-detail {
    min-height: 100%;
    background: @card-bg-color;
  }

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 64px;
    padding: 12px 20px;
    border-bottom: 1px solid @divider-color;
  }

  .detail-title {
    color: @text-primary-color;
    font-size: 16px;
    font-weight: 700;
  }

  .detail-code {
    margin-top: 2px;
    color: @text-secondary-color;
    font-size: 12px;
  }

  .detail-body {
    padding: 20px;
  }
</style>
