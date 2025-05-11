<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';

const props = defineProps<{
  modelValue: string;
  placeholder: string;
  errorMessage?: string | { message: string };
}>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="props.placeholder" class="sr-only">{{
      props.placeholder
    }}</label>
    <InputText
      :model-value="props.modelValue"
      :placeholder="props.placeholder"
      fluid
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
