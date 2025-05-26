<script setup lang="ts">
import type { Address } from '@commercetools/platform-sdk';
import { defineProps, computed } from 'vue';

defineEmits<{
  (e: 'add'): void;
  (e: 'edit', address: Address): void;
  (e: 'delete', address: Address): void;
  (e: 'set-default', address: Address, type: 'shipping' | 'billing'): void;
}>();

const props = defineProps<{
  title: string;
  addresses: Address[];
  type: 'shipping' | 'billing';
  defaultShippingAddressId?: string | undefined;
  defaultBillingAddressId?: string | undefined;
}>();

function isDefaultAddress(address: Address): boolean {
  const defaultId =
    props.type === 'shipping'
      ? props.defaultShippingAddressId
      : props.defaultBillingAddressId;
  return defaultId === address.id;
}

const sortedAddresses = computed(() => {
  const defaultId =
    props.type === 'shipping'
      ? props.defaultShippingAddressId
      : props.defaultBillingAddressId;

  return [...props.addresses].sort((a, b) => {
    if (a.id === defaultId) return -1;
    if (b.id === defaultId) return 1;
    return 0;
  });
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-1">
      <h2 class="text-base font-semibold">{{ title }}</h2>
      <button
        class="text-xs text-blue-600 hover:underline cursor-pointer"
        @click="$emit('add')"
      >
        + Add {{ type === 'shipping' ? 'Shipping' : 'Billing' }} Address
      </button>
    </div>

    <div
      v-for="address in sortedAddresses"
      :key="address.id"
      class="address-section p-4 bg-white rounded-lg shadow mb-4"
      :class="{
        'border-blue-300 border': isDefaultAddress(address),
      }"
    >
      <p class="flex gap-2">
        <strong class="w-48">Street:</strong> {{ address.streetName }}
      </p>
      <p class="flex gap-2">
        <strong class="w-48">City:</strong> {{ address.city }}
      </p>
      <p class="flex gap-2">
        <strong class="w-48">Postal Code:</strong> {{ address.postalCode }}
      </p>
      <p class="flex gap-2">
        <strong class="w-48">Country:</strong> {{ address.country }}
      </p>

      <div class="flex gap-3 mt-2 text-xs text-blue-600">
        <button
          class="cursor-pointer hover:underline"
          @click="$emit('edit', address)"
        >
          Edit
        </button>
        <button
          class="cursor-pointer hover:underline"
          @click="$emit('delete', address)"
        >
          Delete
        </button>
        <button
          v-if="!isDefaultAddress(address)"
          class="cursor-pointer hover:underline"
          @click="$emit('set-default', address, type)"
        >
          Set as default
        </button>
        <p v-if="isDefaultAddress(address)" class="text-gray-600">
          {{
            type === 'shipping'
              ? '📦 Default shipping address'
              : '💳 Default billing address'
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.default {
  background-color: #e6f7ff;
}
</style>
