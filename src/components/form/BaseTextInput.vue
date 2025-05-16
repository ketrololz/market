<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
import type { InputFieldProps } from './types/InputFieldProps';

const props = defineProps<InputFieldProps>();
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex flex-col">
    <IconField v-if="props.icon">
      <InputIcon :class="`pi ${props.icon}`" />
      <InputText
        :id="props.inputId"
        size="small"
        :model-value="props.modelValue ? String(props.modelValue) : null"
        :placeholder="props.placeholder"
        fluid
        :readonly="props.readonly"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </IconField>

    <InputText
      v-else
      :id="props.inputId"
      size="small"
      :model-value="
        props.modelValue instanceof Date
          ? props.modelValue.toISOString()
          : props.modelValue
      "
      :placeholder="props.placeholder"
      fluid
      :readonly="props.readonly"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <Message v-if="props.errorMessage" severity="error" variant="simple">{{
      typeof props.errorMessage === 'string'
        ? props.errorMessage
        : props.errorMessage?.message
    }}</Message>
  </div>
</template>
