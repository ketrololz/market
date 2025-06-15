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
import type { FormInstance, FormSubmitEvent } from '@primevue/forms';

import {
  useAuthStore,
  type RegistrationData,
  type AddressFormData,
} from '@stores/authStore';
import appLogger from '@utils/logger';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import TabPanels from 'primevue/tabpanels';
import Tab from 'primevue/tab';
import TabPanel from 'primevue/tabpanel';
import AddressFields from '../../components/form/AddressFields.vue';
import { Message } from 'primevue';
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import { useProjectSettingsStore } from '@/stores/projectSettingsStore';
import { useCountries } from '@/composables/useCountries';

const authStore = useAuthStore();
const projectSettingsStore = useProjectSettingsStore();

const sameAddress = ref(true);

const { countries } = useCountries();

onMounted(async () => {
  if (projectSettingsStore.getAvailableCountries.length === 0) {
    await projectSettingsStore.fetchProjectSettings();
  }
});

const activeTab = ref<string | number>('shipping');
const tabErrors = ref<{ shipping: boolean; billing: boolean }>({
  shipping: false,
  billing: false,
});

async function onFormSubmit({ values, valid }: FormSubmitEvent) {
  if (valid) {
    appLogger.log('Form is valid, received values:', values);

    const shippingAddressPayload: AddressFormData = {
      firstName: values.firstName,
      lastName: values.lastName,
      streetName: values.shippingAddress.streetName,
      city: values.shippingAddress.city,
      postalCode: values.shippingAddress.postalCode,
      country: values.shippingAddress.country,
      isDefaultShipping: values.shippingAddress.defaultShipping,
      isDefaultBilling: values.sameAsShipping
        ? values.shippingAddress.defaultBilling
        : false,
    };

    const billingAddressPayload: AddressFormData = {
      firstName: values.firstName,
      lastName: values.lastName,
      streetName: values.billingAddress.streetName,
      city: values.billingAddress.city,
      postalCode: values.billingAddress.postalCode,
      country: values.billingAddress.country,
      isDefaultBilling: values.billingAddress.defaultBilling,
    };

    const registrationPayload: RegistrationData = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth?.toISOString().split('T')[0],
      shippingAddress: shippingAddressPayload,
      sameAsShipping: values.sameAsShipping,
      billingAddress: values.sameAsShipping
        ? shippingAddressPayload
        : billingAddressPayload,
    };
    appLogger.log('Submitting Registration Payload:', registrationPayload);
    const success = await authStore.register(registrationPayload);
    if (success) {
      appLogger.log('Registration & auto-login successful from component.');
    } else {
      appLogger.warn(
        'Registration or auto-login failed. Error details in store:',
        authStore.authErrorDetails,
      );
    }
  }
}
const isLoading = computed(() => authStore.isLoading);

const form = ref();

watch(
  () => sameAddress.value && form.value,
  (enabled) => {
    if (enabled) {
      syncAddresses();
    }
  },
  { immediate: true },
);

watch(
  () => [
    form.value?.getFieldState('shippingAddress.streetName')?.value,
    form.value?.getFieldState('shippingAddress.city')?.value,
    form.value?.getFieldState('shippingAddress.postalCode')?.value,
    form.value?.getFieldState('shippingAddress.country')?.value,
  ],
  () => {
    if (sameAddress.value) {
      syncAddresses();
    }
  },
  { deep: true },
);

watchEffect(() => {
  const shipping = form.value?.states?.shippingAddress ?? {};
  const billing = form.value?.states?.billingAddress ?? {};
  tabErrors.value.shipping = Object.values(
    shipping as Record<string, { invalid?: boolean }>,
  ).some((field) => field?.invalid === true);
  tabErrors.value.billing = Object.values(
    billing as Record<string, { invalid?: boolean }>,
  ).some((field) => field?.invalid === true);
});

function syncAddresses() {
  const formInstance = form.value as FormInstance;
  if (!formInstance) return;

  const fieldsToCopy = ['streetName', 'city', 'postalCode', 'country'];

  fieldsToCopy.forEach((field) => {
    const source = formInstance.getFieldState(
      `shippingAddress.${field}`,
    )?.value;
    const targetField = `billingAddress.${field === 'defaultShipping' ? 'defaultBilling' : field}`;
    formInstance.setFieldValue(targetField, source);
  });
}
</script>

<template>
  <Panel
    header=" Create New Customer Account"
    pt:header:class="justify-self-center text-xl pb-0!"
    pt:root:class="pb-10 text-center"
    ><span class="text-gray-500 font-medium text-xs"
      >If you have an account,
      <RouterLink
        to="/login"
        class="underline text-(--p-primary-color) hover:text-indigo-700 active:text-indigo-800"
        >sign in</RouterLink
      >
      with your email address.
    </span>
    <div class="flex flex-col items-center w-full min-[400px]:px-8">
      <div class="text-center mb-8"></div>
      <Form
        ref="form"
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
          <FormField
            v-slot="slotProps"
            name="firstName"
            class="w-1/2 max-w-[178px]"
          >
            <label for="first-name" class="text-xs">First Name</label>
            <BaseInput
              input-id="first-name"
              :model-value="slotProps.value"
              :error-message="slotProps.error"
            />
          </FormField>
          <FormField
            v-slot="slotProps"
            name="lastName"
            class="w-1/2 max-w-[178px]"
          >
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

        <Tabs
          :value="activeTab"
          class="w-full"
          @update:value="(val) => (activeTab = val)"
        >
          <TabList>
            <Tab
              value="shipping"
              class="text-sm !pb-1"
              :class="{
                '!text-red-500': tabErrors.shipping && activeTab !== 'shipping',
              }"
              >Shipping Address</Tab
            >
            <Tab
              value="billing"
              class="text-sm !pb-1"
              :class="{
                '!text-red-500': tabErrors.billing && activeTab !== 'billing',
              }"
              >Billing Address</Tab
            >
          </TabList>
          <TabPanels class="!px-0">
            <TabPanel value="shipping">
              <AddressFields
                :path="'shippingAddress'"
                :countries="countries"
                :form="form"
                :max-width-class="`max-w-[178px]`"
              />
            </TabPanel>
            <TabPanel value="billing">
              <AddressFields
                :path="'billingAddress'"
                :countries="countries"
                :readonly="sameAddress"
                :form="form"
                :max-width-class="`max-w-[178px]`"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <div class="flex items-center gap-2">
          <Checkbox v-model="sameAddress" input-id="same-as-billing" binary />
          <label for="same-as-billing" class="text-xs">
            Shipping address is the same as billing address
          </label>
        </div>

        <Message
          v-if="
            (tabErrors.shipping && activeTab !== 'shipping') ||
            (tabErrors.billing && activeTab !== 'billing')
          "
          severity="error"
          variant="simple"
          class="text-left mt-2"
        >
          Please check fields in the
          <strong>{{
            activeTab === 'shipping' && tabErrors.billing
              ? 'Billing Address'
              : activeTab === 'billing' && tabErrors.shipping
                ? 'Shipping Address'
                : ''
          }}</strong>
          tab.
        </Message>
        <Button
          size="small"
          label="Sign up"
          type="submit"
          class="w-full mt-8"
          :loading="isLoading"
          :disabled="isLoading"
        />
      </Form>
    </div>
  </Panel>
</template>
