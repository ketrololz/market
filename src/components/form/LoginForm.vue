<script setup lang="ts">
import { Form, FormField } from '@primevue/forms';
import { loginSchema } from './../../schemas/loginSchema';
import Button from 'primevue/button';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import BaseInput from './BaseTextInput.vue';
import BasePassword from './../../components/form/BasePassword.vue';
import type { FormSubmitEvent } from '@primevue/forms';

const initialValues = {
  email: '',
  password: '',
};

function onFormSubmit({ values, valid }: FormSubmitEvent) {
  if (valid) {
    console.log('send data to server', values);
  }
}
</script>

<template>
  <div class="flex flex-col items-center w-full px-8">
    <div class="text-center mb-8">
      <div class="text-2xl font-medium">Customer Login</div>
      <span class="text-gray-500 font-medium text-xs"
        >If you have an account, sign in with your email address.</span
      >
    </div>
    <Form
      :initial-values
      :resolver="yupResolver(loginSchema)"
      class="flex flex-col gap-4 w-full sm:w-60"
      @submit="onFormSubmit"
    >
      <FormField v-slot="slotProps" name="email">
        <BaseInput
          :model-value="slotProps.value"
          :error-message="slotProps.error"
          placeholder="Email"
          icon="pi-envelope"
        />
      </FormField>

      <FormField v-slot="{ value, error }" name="password">
        <BasePassword
          icon="pi-key"
          :model-value="value"
          placeholder="Password"
          :error-message="error"
        />
      </FormField>

      <Button size="small" label="Sign in" type="submit" class="w-full" />
    </Form>
  </div>
</template>
