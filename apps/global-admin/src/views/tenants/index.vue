<template>
  <section class="page">
    <Alert
      v-if="errorMessage"
      class="page-alert"
      type="error"
      show-icon
      :message="errorTitle"
      :description="errorMessage"
    >
      <template #action>
        <ApButton size="small" @click="load">重试</ApButton>
      </template>
    </Alert>

    <div v-else class="grid-fill">
      <AgGrid
        :columns="columns"
        :data-source="tenants"
        :loading="loading"
        :search-form="false"
        :pagination="false"
        :wrapper-style="{ height: '100%' }"
        :row-class-name="getPointerRowClassName()"
        row-key="tenantCode"
        browser-tooltips
        column-resizable
        @row-clicked="handleRowClicked"
      >
        <template #title="{ selectedRowKeys, clearAll }">
          <TableTopActionBar
            :selected-row-keys="selectedRowKeys"
            :clear-all="clearAll"
            :show-selected="false"
            :settings="{
              persistenceKey: 'global_admin_table_tenants_tenant-list'
            }"
            :refresh-config="{ refresh: load }"
          />
        </template>
      </AgGrid>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { Alert } from '@aplus-frontend/antdv';
  import { AgGrid, ApButton, type AgGridColumnType } from '@aplus-frontend/ui';
  import { TableTopActionBar } from '@aplus-sql/ui-kit/components';
  import { useRowClickAction } from '@aplus-sql/ui-kit/hooks';
  import {
    listTenants,
    type GlobalAdminTenantSummary
  } from '@/api/global-admin';

  const route = useRoute();
  const loading = ref(false);
  const tenants = ref<GlobalAdminTenantSummary[]>([]);
  const errorMessage = ref('');
  const errorTitle = computed(() =>
    errorMessage.value.includes('无总控台访问权限')
      ? '无访问权限'
      : '租户数据加载失败'
  );
  const { onRowClick, getPointerRowClassName, clickAction } =
    useRowClickAction('tenants');

  const columns: AgGridColumnType<GlobalAdminTenantSummary>[] = [
    {
      title: '服务商编码',
      key: 'supplierCode',
      dataIndex: 'supplierCode',
      width: 130,
      valueType: 'text'
    },
    {
      title: '租户编码',
      key: 'tenantCode',
      dataIndex: 'tenantCode',
      width: 180,
      valueType: 'text'
    },
    {
      title: '租户名称',
      key: 'displayName',
      dataIndex: 'displayName',
      minWidth: 220,
      flex: 1,
      valueType: 'text'
    },
    {
      title: '域名标记',
      key: 'hostTag',
      dataIndex: 'hostTag',
      minWidth: 180,
      flex: 1,
      valueType: 'text'
    },
    {
      title: '操作',
      key: 'actions',
      dataIndex: 'actions',
      width: 100,
      fixed: 'right',
      valueType: 'action',
      fieldProps: {
        actions: [clickAction({ text: '查看' })]
      }
    }
  ];

  async function load() {
    loading.value = true;
    errorMessage.value = '';
    try {
      tenants.value = await listTenants();
    } catch (error) {
      tenants.value = [];
      errorMessage.value =
        error instanceof Error ? error.message : String(error);
    } finally {
      loading.value = false;
    }
  }

  function handleRowClicked(
    record: GlobalAdminTenantSummary,
    event?: Event | null
  ) {
    onRowClick(event, {
      query: {
        ...Object.fromEntries(
          Object.entries(route.query).flatMap(([key, value]) =>
            typeof value === 'string' ? [[key, value]] : []
          )
        ),
        drawer: 'tenant-detail',
        drawerCode: record.tenantCode
      },
      replace: Boolean(route.query.drawer)
    });
  }

  onMounted(load);
</script>

<style scoped>
  .page-alert {
    margin: 4px;
  }
</style>
