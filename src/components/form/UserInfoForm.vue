<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue';
import { Form, FormField } from '@primevue/forms';
import type { FormInstance } from '@primevue/forms';
import BaseInput from '@/components/form/BaseTextInput.vue';
import BaseInputDate from '@/components/form/BaseInputDate.vue';
import { userInfoSchema } from '@/schemas/userInfoSchema';
import { yupResolver } from '@primevue/forms/resolvers/yup';

export interface UserInfoFormData {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

const props = defineProps<{
  initialValues: UserInfoFormData;
}>();

const emit = defineEmits<{
  (e: 'submit', data: UserInfoFormData): void;
}>();

const formRef = ref<FormInstance>();

const formData = ref<UserInfoFormData>({ ...props.initialValues });

function submitForm() {
  emit('submit', formData.value);
}

defineExpose({ submit: submitForm });
</script>

<template>
  <Form
    ref="formRef"
    :resolver="yupResolver(userInfoSchema)"
    class="flex flex-col gap-2"
    @submit="submitForm"
  >
    <FormField v-slot="slotProps" name="email">
      <BaseInput
        input-id="email"
        :model-value="formData.email"
        placeholder="Email"
        icon="pi-envelope"
        :error-message="slotProps.error"
        @update:model-value="formData.email = $event"
      />
    </FormField>

    <FormField v-slot="slotProps" name="firstName">
      <BaseInput
        input-id="first-name"
        :model-value="formData.firstName"
        placeholder="First Name"
        :error-message="slotProps.error"
        @update:model-value="formData.firstName = $event"
      />
    </FormField>

    <FormField v-slot="slotProps" name="lastName">
      <BaseInput
        input-id="last-name"
        :model-value="formData.lastName"
        placeholder="Last Name"
        :error-message="slotProps.error"
        @update:model-value="formData.lastName = $event"
      />
    </FormField>

    <FormField v-slot="slotProps" name="dateOfBirth">
      <BaseInputDate
        input-id="dob"
        :model-value="formData.dateOfBirth"
        placeholder="YYYY-MM-DD"
        show-icon
        icon-class="pi pi-calendar"
        :error-message="slotProps.error"
        @update:model-value="formData.dateOfBirth = $event"
      />
    </FormField>
  </Form>
</template>
