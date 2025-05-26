<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AuthService from '@/services/auth/authService';
import type { Customer, Address } from '@commercetools/platform-sdk';
import { Panel } from 'primevue';
import AddressSection from './AddressSection.vue';

const customer = ref<Customer | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const user = await AuthService.restoreSession();
    if (user) {
      customer.value = user;
    }
  } catch (error) {
    console.error('Error while restoring session:', error);
  } finally {
    isLoading.value = false;
  }
});

const shippingAddresses = computed(
  () =>
    customer.value?.addresses.filter((addr) =>
      customer.value?.shippingAddressIds?.includes(addr.id ?? ''),
    ) ?? [],
);

const billingAddresses = computed(
  () =>
    customer.value?.addresses.filter(
      (addr) =>
        customer.value?.billingAddressIds?.includes(addr.id ?? '') &&
        !shippingAddresses.value.some((a) => a.id === addr.id),
    ) ?? [],
);

function onEdit() {
  console.log('Edit personal information', customer.value);
}

function onAddNewAddress() {
  console.log('Add new address');
}

function onEditAddress(address: Address) {
  console.log('Edit address:', address);
}

function onDeleteAddress(address: Address) {
  console.log('Delete address:', address);
}

function onSetDefault(address: Address, type: 'shipping' | 'billing') {
  console.log(`Set address ${address.id} as default ${type} address`);
}
</script>

<template>
  <div class="text-sm">
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="customer">
      <h1 class="text-center">User Profile</h1>
      <Panel
        pt:root:class="p-2  bg-white rounded-lg shadow-md m-4 max-w-3xl mx-auto"
      >
        <template #header>
          <div class="flex justify-between items-center w-full">
            <span class="text-lg">Personal Information</span>
            <button
              class="text-xs text-blue-600 cursor-pointer text-blue-600 hover:underline"
              @click="onEdit"
            >
              Edit
            </button>
          </div>
        </template>
        <p class="flex gap-2">
          <strong class="w-48">Email:</strong> {{ customer.email }}
        </p>
        <p class="flex gap-2">
          <strong class="w-48">First Name:</strong> {{ customer.firstName }}
        </p>
        <p class="flex gap-2">
          <strong class="w-48">Last Name:</strong> {{ customer.lastName }}
        </p>
        <p class="flex gap-2">
          <strong class="w-48">Date of Birth:</strong>
          {{ customer.dateOfBirth }}
        </p>
      </Panel>

      <Panel
        pt:root:class="p-2  bg-white rounded-lg shadow-md m-4  max-w-3xl mx-auto"
      >
        <template #header>
          <div class="flex justify-between items-center w-full">
            <span class="text-lg">Password</span>
            <button
              class="text-xs text-blue-600 cursor-pointer hover:underline"
              @click="onEdit"
            >
              Edit
            </button>
          </div>
        </template>
        <p class="flex gap-2">
          <strong class="w-48">Password:</strong> *********
        </p>
      </Panel>

      <Panel
        pt:root:class="p-2 bg-white rounded-lg shadow-md m-4  max-w-3xl mx-auto"
      >
        <template #header>
          <div class="text-lg">Addresses</div>
        </template>

        <div>
          <AddressSection
            title="Shipping Addresses"
            :addresses="shippingAddresses"
            type="shipping"
            :default-shipping-address-id="customer.defaultShippingAddressId"
            @edit="onEditAddress"
            @delete="onDeleteAddress"
            @set-default="onSetDefault"
            @add="onAddNewAddress"
          />

          <AddressSection
            title="Billing Addresses"
            :addresses="billingAddresses"
            type="billing"
            :default-billing-address-id="customer.defaultBillingAddressId"
            @edit="onEditAddress"
            @delete="onDeleteAddress"
            @set-default="onSetDefault"
            @add="onAddNewAddress"
          />
        </div>
      </Panel>
    </div>
  </div>
</template>
