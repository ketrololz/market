<script setup lang="ts">
import Password from 'primevue/password';
import Message from 'primevue/message';
const props = defineProps<{
  modelValue: string;
  placeholder: string;
  errorMessage?: string | { message: string };
}>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <Password
      :model-value="props.modelValue"
      :placeholder="props.placeholder"
      :feedback="false"
      fluid
      toggle-mask
    />
    <Message v-if="props.errorMessage" severity="error">{{
      typeof props.errorMessage === 'string'
        ? props.errorMessage
        : props.errorMessage?.message
    }}</Message>
  </div>
</template>

<script lang="ts">
export default {};
</script>
