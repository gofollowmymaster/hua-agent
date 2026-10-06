<template>
  <Modal
    :open="open"
    :title="item ? '编辑用户 Skill' : '新建用户 Skill'"
    :footer="null"
    width="720px"
    destroy-on-close
    @cancel="close"
  >
    <ApForm
      :key="item?.id ?? 'new'"
      layout="vertical"
      :initial-values="initialValues"
      @finish="submit"
    >
      <ApForm.FormItem
        label="名称"
        name="name"
        :rules="[
          { required: true, message: '请输入 Skill 名称' },
          { max: 64, message: '名称不能超过 64 个字符' }
        ]"
      >
        <Input :maxlength="64" show-count />
      </ApForm.FormItem>
      <ApForm.FormItem
        label="描述"
        name="description"
        :rules="[{ max: 500, message: '描述不能超过 500 个字符' }]"
      >
        <Textarea :maxlength="500" :rows="3" show-count />
      </ApForm.FormItem>
      <ApForm.FormItem
        label="Markdown 指令"
        name="instruction"
        :rules="[
          { required: true, message: '请输入 Skill 指令' },
          { max: 12000, message: '指令不能超过 12000 个字符' }
        ]"
      >
        <Textarea :maxlength="12000" :rows="10" show-count />
      </ApForm.FormItem>
      <ApForm.FormItem label="启用" name="isEnabled" value-prop-name="checked">
        <Switch />
      </ApForm.FormItem>
      <Space class="form-actions">
        <ApButton @click="close">取消</ApButton>
        <ApButton type="primary" html-type="submit" :loading="saving">
          保存
        </ApButton>
      </Space>
    </ApForm>
  </Modal>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import {
    Input,
    Modal,
    Space,
    Switch,
    Textarea,
    message
  } from '@aplus-frontend/antdv';
  import { ApButton, ApForm } from '@aplus-frontend/ui';
  import {
    createUserSkill,
    updateUserSkill,
    type SaveUserSkillParams,
    type UserSkillItem
  } from '@/api/business-agent/skills';

  const props = defineProps<{ open: boolean; item?: UserSkillItem }>();
  const emit = defineEmits<{
    'update:open': [value: boolean];
    saved: [];
  }>();
  const saving = ref(false);
  const initialValues = computed<SaveUserSkillParams>(() => ({
    name: props.item?.name ?? '',
    description: props.item?.description ?? '',
    instruction: props.item?.instruction ?? '',
    isEnabled: props.item?.isEnabled ?? true
  }));

  function close() {
    emit('update:open', false);
  }

  async function submit(values: SaveUserSkillParams) {
    saving.value = true;
    try {
      if (props.item) await updateUserSkill(props.item.id, values);
      else await createUserSkill(values);
      message.success(props.item ? '用户 Skill 已更新' : '用户 Skill 已创建');
      emit('saved');
      close();
    } finally {
      saving.value = false;
    }
  }
</script>

<style lang="less" scoped>
  .form-actions {
    display: flex;
    justify-content: flex-end;
  }
</style>
