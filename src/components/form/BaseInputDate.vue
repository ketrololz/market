<script setup lang="ts">
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import type { InputFieldProps } from './types/InputFieldProps';

const props = defineProps<InputFieldProps>();
</script>

<template>
  <div class="flex flex-col">
    <IconField>
      <InputIcon :class="`pi ${props.icon}` || 'pi pi-calendar'" />
      <DatePicker
        :input-id="props.inputId"
        size="small"
        :model-value="
          typeof props.modelValue === 'string'
            ? new Date(props.modelValue)
            : props.modelValue
        "
        :placeholder="props.placeholder"
        :show-icon="props.showIcon ?? false"
        class="w-full"
      />
    </IconField>

    <Message v-if="props.errorMessage" severity="error" variant="simple">{{
      typeof props.errorMessage === 'string'
        ? props.errorMessage
        : props.errorMessage?.message
    }}</Message>
  </div>
</template>
