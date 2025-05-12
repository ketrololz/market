<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  placeholder: string;
  errorMessage?: string;
}>();
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex flex-col gap-1">
    <InputText
      :model-value="props.modelValue"
      :placeholder="props.placeholder"
      class="w-full"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <Message v-if="props.errorMessage" severity="error">{{
      props.errorMessage
    }}</Message>
  </div>
</template>
