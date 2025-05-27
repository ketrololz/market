<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { computed } from 'vue';

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const props = defineProps<{
  title: string;
  edit?: boolean;
  modelValue: boolean;
  initialValues?: unknown;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit'): void;
}>();
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    closable
    :header="props.title"
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
        @click="$emit('submit')"
      />
    </template>
  </Dialog>
</template>
