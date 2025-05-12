<script setup lang="ts">
import { Form, FormField } from '@primevue/forms';
import { registrationSchema } from './../../schemas/registrationSchema';
import Button from 'primevue/button';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import BaseInput from './../../components/form/BaseTextInput.vue';
import BasePassword from './../../components/form/BasePassword.vue';
import BaseInputDate from './../../components/form/BaseInputDate.vue';
import Panel from 'primevue/panel';
import Divider from 'primevue/divider';
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
  <Panel
    header=" Create New Customer Account"
    pt:header:class="justify-self-center text-xl"
    pt:root:class="pb-10"
  >
    <div class="flex flex-col items-center w-full px-8">
      <div class="text-center mb-8"></div>
      <Form
        :initial-values
        :resolver="yupResolver(registrationSchema)"
        class="flex flex-col gap-2 w-full"
        @submit="onFormSubmit"
      >
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

        <Divider />

        <h2 class="text-gray-700 font-medium text-center">
          Personal Information
        </h2>
        <div class="flex gap-2">
          <FormField v-slot="slotProps" name="firstName" class="w-1/2">
            <BaseInput
              id="firstName"
              label="First Name"
              :model-value="slotProps.value"
              :error-message="slotProps.error"
            />
          </FormField>
          <FormField v-slot="slotProps" name="lastName" class="w-1/2">
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

        <h2 class="text-gray-700 font-medium text-center mt-5">Address</h2>
        <div class="flex gap-2">
          <FormField v-slot="slotProps" name="address.street" class="w-1/2">
            <BaseInput
              id="street1"
              label="Street"
              :model-value="slotProps.value"
              :error-message="slotProps.error"
            />
          </FormField>
          <FormField v-slot="slotProps" name="address.city" class="w-1/2">
            <BaseInput
              id="city1"
              label="City"
              :model-value="slotProps.value"
              :error-message="slotProps.error"
            />
          </FormField>
        </div>
        <div class="flex gap-2">
          <FormField v-slot="slotProps" name="address.postalCode" class="w-1/2">
            <label for="postal-code1" class="text-sm">Postal Code</label>
            <BaseInput
              id="postal-code1"
              v-model="slotProps.value"
              :error-message="slotProps.error"
              :options="countries"
              filter
              placeholder="Select a Country"
              class="w-full"
            />
          </FormField>
          <FormField v-slot="slotProps" name="address.country" class="w-1/2">
            <label for="country" class="text-sm">Country</label>
            <Select
              v-model="slotProps.value"
              :options="countries"
              filter
              size="small"
              placeholder="Select a Country"
              class="w-full"
            >
              <template #value="valueSlotProps">
                <div v-if="valueSlotProps.value">
                  <div>{{ valueSlotProps.value.name }}</div>
                </div>
                <span v-else>
                  {{ valueSlotProps.placeholder }}
                </span>
              </template>
              <template #option="optionSlotProps">
                <div>{{ optionSlotProps.option.name }}</div>
              </template>
            </Select>
          </FormField>
        </div>

        <Button size="small" label="Sign up" type="submit" class="w-full" />
      </Form>
    </div>
  </Panel>
</template>
