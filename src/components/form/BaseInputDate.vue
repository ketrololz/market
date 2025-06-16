<script setup lang="ts">
import { computed } from 'vue';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import InputIcon from 'primevue/inputicon';
import type { InputFieldProps } from './types/InputFieldProps';

const props = defineProps<InputFieldProps>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const modelDate = computed<Date | null>({
  get: () => {
    if (!props.modelValue) return null;
    const date = new Date(props.modelValue);
    return isNaN(date.getTime()) ? null : date;
  },
  set: (val) => {
    if (!val) emit('update:modelValue', '');
    else emit('update:modelValue', val.toISOString().split('T')[0]);
  },
});
</script>

<template>
  <div class="flex flex-col">
    <InputIcon :class="`pi ${props.icon}` || 'pi pi-calendar'" />
    <DatePicker
      v-model="modelDate"
      :input-id="props.inputId"
      size="small"
      :placeholder="props.placeholder"
      :show-icon="props.showIcon ?? false"
      class="w-full"
    />

    <Message
      v-if="props.errorMessage"
      severity="error"
      variant="simple"
      class="text-left"
      >{{
        typeof props.errorMessage === 'string'
          ? props.errorMessage
          : props.errorMessage?.message
      }}</Message
    >
  </div>
</template>
