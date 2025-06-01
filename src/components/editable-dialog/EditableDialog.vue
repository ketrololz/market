<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { computed } from 'vue';
import { ref } from 'vue';
import type { UserInfoFormRef } from '../form/types/UserFormRef';

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const dialogHeader = computed(() => {
  return props.edit ? props.title : props.title.replace(/^Edit/, 'Add');
});

const props = defineProps<{
  title: string;
  edit?: boolean;
  modelValue: boolean;
  initialValues?: unknown;
  formRef?: UserInfoFormRef;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit'): void;
}>();

const formComponent = ref<UserInfoFormRef>();

const isFormValid = computed(() => {
  return formComponent.value?.isValid?.value ?? true;
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    closable
    :header="dialogHeader"
    :style="{ width: '50vw' }"
  >
    <p class="text-sm text-gray-600 mb-4">
      {{
        props.edit
          ? 'Please edit the information below.'
          : 'Please provide the information below.'
      }}
    </p>

    <slot :initial-values="props.initialValues" />

    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="visible = false"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        class="p-button-text"
        :disabled="!isFormValid"
        @click="$emit('submit')"
      />
    </template>
  </Dialog>
</template>
