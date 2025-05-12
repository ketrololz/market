<script setup lang="ts">
import Password from 'primevue/password';
import Message from 'primevue/message';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
import type { InputFieldProps } from './types/types';

const props = defineProps<InputFieldProps>();
</script>

<template>
  <div class="flex flex-col">
    <label v-if="props.label" :for="id" class="text-sm ml-3">{{
      props.label
    }}</label>
    <label v-else :for="id" class="sr-only">{{
      props.placeholder || ''
    }}</label>
    <IconField v-if="props.icon">
      <InputIcon :class="`pi ${props.icon}`" />
      <Password
        size="small"
        :model-value="props.modelValue ? String(props.modelValue) : null"
        :placeholder="props.placeholder"
        :feedback="false"
        fluid
        toggle-mask
      />
    </IconField>

    <Password
      v-else
      size="small"
      :model-value="props.modelValue ? String(props.modelValue) : null"
      :placeholder="props.placeholder"
      :feedback="false"
      fluid
      toggle-mask
    />

    <Message v-if="props.errorMessage" severity="error" variant="simple">{{
      typeof props.errorMessage === 'string'
        ? props.errorMessage
        : props.errorMessage?.message
    }}</Message>
  </div>
</template>
