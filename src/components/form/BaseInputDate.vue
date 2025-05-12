<script setup lang="ts">
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import type { InputFieldProps } from './types/types';

const props = defineProps<InputFieldProps>();
</script>

<template>
  <div class="flex flex-col">
    <label v-if="props.label" :for="id" class="text-sm ml-3">{{
      props.label
    }}</label>
    <IconField v-if="props.showIconField">
      <InputIcon :class="`pi ${props.icon}` || 'pi pi-calendar'" />
      <DatePicker
        size="small"
        :input-id="id"
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
    <DatePicker
      v-else
      size="small"
      :input-id="id"
      :model-value="
        typeof props.modelValue === 'string'
          ? new Date(props.modelValue)
          : props.modelValue
      "
      :placeholder="props.placeholder"
      :show-icon="props.showIcon ?? false"
      class="w-full"
    />
    <Message
      v-if="props.errorMessage"
      size="small"
      severity="error"
      variant="simple"
      >{{
        typeof props.errorMessage === 'string'
          ? props.errorMessage
          : props.errorMessage?.message
      }}</Message
    >
  </div>
</template>
