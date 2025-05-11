<script setup lang="ts">
import { Form, FormField } from '@primevue/forms';
import { registrationSchema } from './../../schemas/registrationSchema';
import Button from 'primevue/button';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import BaseInput from './../../components/form/BaseTextInput.vue';
import BasePassword from './../../components/form/BasePassword.vue';
import BaseInputDate from './../../components/form/BaseInputDate.vue';
import Select from 'primevue/select';
import type { FormSubmitEvent } from '@primevue/forms';

import { ref } from 'vue';

const initialValues = {
  firstName: '',
  lastName: '',
  dateOfBirth: null,
  email: '',
  password: '',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: '',
  },
};

const countries = ref([
  { name: 'Germany', code: 'DE' },
  { name: 'Russia', code: 'RU' },
  { name: 'United State', code: 'US' },
]);

function onFormSubmit({ values, valid }: FormSubmitEvent) {
  if (valid) {
    console.log('send data to server', values);
  }
}
</script>

<template>
  <div class="card">
    <div class="flex flex-col items-center w-full px-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-medium mb-4">Create New Customer Account</h1>
      </div>
      <Form
        :initial-values
        :resolver="yupResolver(registrationSchema)"
        class="flex flex-col gap-2 w-full sm:w-60"
        @submit="onFormSubmit"
      >
        <h2 class="text-gray-700 font-medium text-center">
          Personal Information
        </h2>
        <div class="flex gap-2">
          <FormField v-slot="slotProps" name="firstName">
            <BaseInput
              id="firstName"
              label="First Name"
              :model-value="slotProps.value"
              :error-message="slotProps.error"
            />
          </FormField>
          <FormField v-slot="slotProps" name="lastName">
            <BaseInput
              id="lastName"
              label="Last Name"
              :model-value="slotProps.value"
              :error-message="slotProps.error"
            />
          </FormField>
        </div>
        <FormField v-slot="slotProps" name="dateOfBirth">
          <BaseInputDate
            :model-value="slotProps.value"
            :error-message="slotProps.error"
            placeholder="DD/MM/YYYY"
            show-icon
            label="Date of Birth"
            icon-class="pi pi-calendar"
          />
        </FormField>

        <h2 class="text-gray-700 font-medium text-center">Login Information</h2>
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

        <h2 class="text-gray-700 font-medium text-center">Address</h2>
        <div class="flex gap-2">
          <FormField v-slot="slotProps" name="address.street">
            <BaseInput
              id="street1"
              label="Street"
              :model-value="slotProps.value"
              :error-message="slotProps.error"
            />
          </FormField>
          <FormField v-slot="slotProps" name="address.city">
            <BaseInput
              id="city1"
              label="City"
              :model-value="slotProps.value"
              :error-message="slotProps.error"
            />
          </FormField>
        </div>
        <div class="flex gap-2">
          <FormField v-slot="slotProps" name="address.postalCode">
            <BaseInput
              id="postal-code1"
              v-model="slotProps.value"
              :error-message="slotProps.error"
              :options="countries"
              filter
              label="Postal Code"
              placeholder="Select a Country"
              class="w-full"
            />
          </FormField>
          <FormField v-slot="slotProps" name="address.country">
            <label for="country" class="text-sm">Country</label>
            <Select
              v-model="slotProps.value"
              :options="countries"
              filter
              size="small"
              placeholder="Select a Country"
              class="w-full"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value">
                  <div>{{ slotProps.value.name }}</div>
                </div>
                <span v-else>
                  {{ slotProps.placeholder }}
                </span>
              </template>
              <template #option="slotProps">
                <div>{{ slotProps.option.name }}</div>
              </template>
            </Select>
          </FormField>
        </div>

        <Button size="small" label="Sign up" type="submit" class="w-full" />
      </Form>
    </div>
  </div>
</template>

<script lang="ts">
export default {};
</script>
