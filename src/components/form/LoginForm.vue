<script setup lang="ts">
import { Form, FormField } from '@primevue/forms';
import { loginSchema } from './../../schemas/loginSchema';
import Button from 'primevue/button';
import Panel from 'primevue/panel';
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
  <Panel
    header="Access Your Account"
    pt:header:class="justify-self-center text-xl pb-0!"
    pt:root:class="pb-5 text-center"
    ><span class="text-gray-500 font-medium text-xs"
      >Don't have a Senet account yet?
      <a
        href="/registration"
        class="underline text-blue-600 hover:text-indigo-700 active:text-indigo-800"
        >Sign up!</a
      ></span
    >
    <div class="flex flex-col items-center w-full px-8">
      <div class="text-center mb-8"></div>
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

        <Button
          size="small"
          label="Sign in"
          type="submit"
          class="w-full mt-5"
        />
      </Form>
    </div>
  </Panel>
</template>
