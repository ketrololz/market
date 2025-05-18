<script setup lang="ts">
import Password from 'primevue/password';
import Message from 'primevue/message';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
import type { InputFieldPropsPass } from './types/InputFieldProps';

const props = defineProps<InputFieldPropsPass>();
</script>

<template>
  <div class="flex flex-col">
    <IconField v-if="props.icon">
      <InputIcon :class="`pi ${props.icon}`" />
      <Password
        :id="props.inputId"
        size="small"
        :model-value="props.modelValue"
        :placeholder="props.placeholder"
        :feedback="false"
        fluid
        toggle-mask
      />
    </IconField>

    <Password
      v-else
      :id="props.inputId"
      size="small"
      :model-value="props.modelValue"
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
