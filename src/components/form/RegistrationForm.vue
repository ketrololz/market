<script setup lang="ts">
import { Form, FormField } from '@primevue/forms';
import { registrationSchema } from './../../schemas/registrationSchema';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import BaseInput from './../../components/form/BaseTextInput.vue';
import BasePassword from './../../components/form/BasePassword.vue';
import BaseInputDate from './../../components/form/BaseInputDate.vue';
import Panel from 'primevue/panel';
import Divider from 'primevue/divider';
import type { FormSubmitEvent } from '@primevue/forms';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import TabPanels from 'primevue/tabpanels';
import Tab from 'primevue/tab';
import TabPanel from 'primevue/tabpanel';
import AddressForm from './AddressForm.vue';

import { ref, watch } from 'vue';

const sameAddress = ref(true);

const initialValues = ref({
  firstName: '',
  lastName: '',
  dateOfBirth: null,
  email: '',
  password: '',
  shippingAddress: {
    street: '',
    city: '',
    postalCode: '',
    country: null,
    defaultShipping: false,
  },
  billingAddress: {
    street: '',
    city: '',
    postalCode: '',
    country: null,
    defaultBilling: false,
  },
});

watch(
  [sameAddress, () => initialValues.value.shippingAddress],
  ([same, shippingAddress]) => {
    console.log('watch triggered, {same, shippingAddress}');
    if (same) {
      console.log('Copying address to billingAddress', shippingAddress);
      initialValues.value.billingAddress = {
        ...shippingAddress,
        defaultBilling: shippingAddress.defaultShipping || false,
      };
    }
  },
  { deep: true },
);

const countries = ref([
  { name: 'Germany', code: 'DE' },
  { name: 'Russia', code: 'RU' },
  { name: 'United States', code: 'US' },
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
    pt:header:class="justify-self-center text-xl pb-0!"
    pt:root:class="pb-10"
    ><p class="text-gray-500 font-medium text-xs text-center">
      If you have an account,
      <a
        href="/login"
        class="underline text-blue-600 hover:text-indigo-700 active:text-indigo-800"
        >sign in</a
      >
      with your email address.
    </p>
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
            input-id="email"
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
            <label for="first-name" class="text-xs">First Name</label>
            <BaseInput
              input-id="first-name"
              :model-value="slotProps.value"
              :error-message="slotProps.error"
            />
          </FormField>
          <FormField v-slot="slotProps" name="lastName" class="w-1/2">
            <label for="last-name" class="text-xs">Last Name</label>
            <BaseInput
              input-id="last-name"
              :model-value="slotProps.value"
              :error-message="slotProps.error"
            />
          </FormField>
        </div>
        <FormField v-slot="slotProps" name="dateOfBirth">
          <label for="birthday" class="text-xs">Date of Birth</label>
          <BaseInputDate
            :model-value="slotProps.value"
            input-id="birthday"
            :error-message="slotProps.error"
            placeholder="YYYY-MM-DD"
            show-icon
            icon-class="pi pi-calendar"
          />
        </FormField>

        <Tabs value="shipping" class="w-full">
          <TabList>
            <Tab value="shipping" class="text-sm pb-1!">Shipping Address</Tab>
            <Tab value="billing" class="text-sm pb-1!">Billing Address</Tab>
          </TabList>
          <TabPanels class="px-0!">
            <TabPanel value="shipping">
              <AddressForm
                v-model="initialValues.shippingAddress"
                :path="'shippingAddress'"
                :countries="countries"
              />
              <div class="mt-2 flex items-center gap-2">
                <Checkbox
                  v-model="sameAddress"
                  input-id="same-as-billing"
                  binary
                />
                <label for="same-as-billing" class="text-xs">
                  Shipping address is the same as billing address
                </label>
              </div>
            </TabPanel>
            <TabPanel value="billing">
              <AddressForm
                v-model="initialValues.billingAddress"
                :path="'billingAddress'"
                :countries="countries"
                :readonly="sameAddress"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Button
          size="small"
          label="Sign up"
          type="submit"
          class="w-full mt-8"
        />
      </Form>
    </div>
  </Panel>
</template>
