<script setup lang="ts">
import type { Address } from '@commercetools/platform-sdk';
import { defineProps, computed, onMounted } from 'vue';
import { useCountries } from '@/composables/useCountries';
import { useProjectSettingsStore } from '@/stores/projectSettingsStore';

const projectSettingsStore = useProjectSettingsStore();

const { countries } = useCountries();

onMounted(async () => {
  if (projectSettingsStore.getAvailableCountries.length === 0) {
    await projectSettingsStore.fetchProjectSettings();
  }
});

defineEmits<{
  (
    e: 'edit-or-add',
    address: Address | null,
    type: 'shipping' | 'billing',
  ): void;
  (e: 'delete', address: Address): void;
  (e: 'set-default', address: Address, type: 'shipping' | 'billing'): void;
}>();

const props = defineProps<{
  title: string;
  addresses: Address[];
  type: 'shipping' | 'billing';
  defaultShippingAddressId?: string | undefined;
  defaultBillingAddressId?: string | undefined;
  isDeleteDisabled?: (address: Address) => boolean;
}>();

const getCountryName = (code: string): string => {
  return countries.value.find((c) => c.code === code)?.name || code;
};

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
      <h2 class="text-sm font-semibold">{{ title }}</h2>
      <button
        class="text-xs text-(--p-primary-color) hover:underline cursor-pointer"
        @click="$emit('edit-or-add', null, type)"
      >
        + Add {{ type === 'shipping' ? 'Shipping' : 'Billing' }} Address
      </button>
    </div>

    <div
      v-for="address in sortedAddresses"
      :key="address.id"
      class="address-section p-4 bg-white rounded-lg shadow mb-4"
      :class="{
        'border-indigo-300 border': isDefaultAddress(address),
      }"
    >
      <div class="space-y-2">
        <p class="flex gap-2 items-center">
          <strong class="max-w-48 w-48 shrink-0 min-w-25 max-sm:w-2/5"
            >Street:</strong
          >
          <span
            class="scroll-container max-w-md overflow-x-auto whitespace-nowrap relative"
            >{{ address.streetName }}</span
          >
        </p>
        <p class="flex gap-2 items-center">
          <strong class="max-w-48 w-48 shrink-0 min-w-25 max-sm:w-2/5"
            >City:</strong
          >
          <span
            class="scroll-container max-w-md overflow-x-auto whitespace-nowrap relative"
            >{{ address.city }}</span
          >
        </p>
        <p class="flex gap-2 items-center">
          <strong class="max-w-48 w-48 shrink-0 min-w-25 max-sm:w-2/5"
            >Postal Code:</strong
          >
          <span
            class="scroll-container max-w-md overflow-x-auto whitespace-nowrap relative"
            >{{ address.postalCode }}</span
          >
        </p>
        <p class="flex gap-2 items-center">
          <strong class="max-w-48 w-48 shrink-0 min-w-25 max-sm:w-2/5"
            >Country:</strong
          ><span
            class="scroll-container max-w-md overflow-x-auto whitespace-nowrap relative"
          >
            {{ getCountryName(address.country) }}</span
          >
        </p>
      </div>
      <div class="flex gap-3 mt-2 text-xs text-(--p-primary-color)">
        <button
          class="cursor-pointer hover:underline"
          @click="$emit('edit-or-add', address, type)"
        >
          Edit
        </button>
        <button
          :disabled="isDeleteDisabled?.(address)"
          :class="{
            'text-gray-400 cursor-not-allowed': isDeleteDisabled?.(address),
            'text-(--p-primary-color)': !isDeleteDisabled?.(address),
          }"
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
