<script setup lang="ts">
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import InputIcon from 'primevue/inputicon';
import type { InputFieldProps } from './types/InputFieldProps';

const props = defineProps<InputFieldProps>();
</script>

<template>
  <div class="flex flex-col">
    <InputIcon :class="`pi ${props.icon}` || 'pi pi-calendar'" />
    <DatePicker
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
