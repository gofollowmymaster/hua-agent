<template>
  <section class="skill-page">
    <Tabs v-model:active-key="activeTab" class="skill-tabs">
      <Tabs.TabPane key="system" tab="系统 Skill">
        <SystemSkillTable />
      </Tabs.TabPane>
      <Tabs.TabPane key="user" tab="用户 Skill">
        <UserSkillTable />
      </Tabs.TabPane>
    </Tabs>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Tabs } from '@aplus-frontend/antdv';
  import SystemSkillTable from './sections/system-skill-table.vue';
  import UserSkillTable from './sections/user-skill-table.vue';

  const activeTab = ref('system');
</script>

<style lang="less" scoped>
  .skill-page,
  .skill-tabs,
  .skill-tabs :deep(.ant-tabs-content-holder),
  .skill-tabs :deep(.ant-tabs-content),
  .skill-tabs :deep(.ant-tabs-tabpane) {
    height: 100%;
    min-height: 0;
  }

  .skill-tabs {
    padding: 0 12px 12px;
    border: 1px solid @border-color;
    border-radius: 8px;
    background: @card-bg-color;
  }
</style>
