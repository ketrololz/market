<script setup lang="ts">
import { defineEmits, ref, computed } from 'vue';
import { Form, FormField } from '@primevue/forms';
import type { FormInstance } from '@primevue/forms';
import BasePassword from '@/components/form/BasePassword.vue';
import { passwordChangeSchema } from '@/schemas/passwordSchema';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import type { FormSubmitEvent } from '@primevue/forms';

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
}

const emit = defineEmits<{
  (e: 'submit', data: PasswordFormData): void;
}>();

const formRef = ref<FormInstance>();

const isValid = computed(() => {
  console.log('PasswordForm isValid:', formRef.value?.valid ?? false);
  return formRef.value?.valid ?? false;
});

async function submit() {
  const result = await formRef.value?.submit();
  return result;
}

async function onFormSubmit({
  values,
  valid,
}: FormSubmitEvent<Record<string, string>>) {
  if (valid) {
    emit('submit', {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  }
}

defineExpose({ submit, isValid });
</script>

<template>
  <Form
    ref="formRef"
    :resolver="yupResolver(passwordChangeSchema)"
    class="flex flex-col gap-2"
    @submit="onFormSubmit"
  >
    <FormField v-slot="{ value, error }" name="currentPassword">
      <BasePassword
        input-id="current-password"
        placeholder="Current Password"
        icon="pi-lock"
        :model-value="value"
        :error-message="error"
      />
    </FormField>

    <FormField v-slot="{ value, error }" name="newPassword">
      <BasePassword
        input-id="new-password"
        placeholder="New Password"
        icon="pi-lock"
        :model-value="value"
        :error-message="error"
      />
    </FormField>
  </Form>
</template>
