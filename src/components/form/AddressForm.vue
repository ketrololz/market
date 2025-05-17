<script setup lang="ts">
import { FormField } from '@primevue/forms';
import BaseInput from './BaseTextInput.vue';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';

const props = defineProps<{
  path: string;
  countries: { name: string; code: string }[];
  readonly?: boolean;
}>();

const getCountryNameByCode = (code: string | undefined | null) => {
  if (!code) return undefined;
  const country = props.countries.find((c) => c.code === code);
  return country?.name;
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <FormField
        v-slot="slotProps"
        :name="`${props.path}.streetName`"
        class="w-1/2"
      >
        <label :for="`${props.path}-streetName`" class="text-xs">Street</label>
        <BaseInput
          :input-id="`${props.path}-streetName`"
          :model-value="slotProps.value"
          :error-message="slotProps.error"
          :readonly="props.readonly"
        />
      </FormField>

      <FormField v-slot="slotProps" :name="`${props.path}.city`" class="w-1/2">
        <label :for="`${props.path}-city`" class="text-xs">City</label>
        <BaseInput
          :input-id="`${props.path}-city`"
          :model-value="slotProps.value"
          :error-message="slotProps.error"
          :readonly="props.readonly"
        />
      </FormField>
    </div>

    <div class="flex gap-2">
      <FormField
        v-slot="slotProps"
        :name="`${props.path}.postalCode`"
        class="w-1/2"
      >
        <label :for="`${props.path}-postalCode`" class="text-xs"
          >Postal Code</label
        >
        <BaseInput
          :input-id="`${props.path}-postalCode`"
          :model-value="slotProps.value"
          :error-message="slotProps.error"
          :readonly="props.readonly"
        />
      </FormField>

      <FormField
        v-slot="slotProps"
        :name="`${props.path}.country`"
        class="w-1/2"
      >
        <label :for="`${props.path}-country`" class="text-xs">Country</label>
        <Select
          :model-value="slotProps.value"
          :options="props.countries"
          size="small"
          placeholder="Select a Country"
          class="w-full"
          :disabled="props.readonly"
          option-label="name"
          option-value="code"
          :input-id="`${props.path}-country`"
        >
          <template #value="{ value: selectedCode, placeholder }">
            <span>{{
              getCountryNameByCode(selectedCode) ||
              placeholder ||
              'Select a Country'
            }}</span>
          </template>
          <template #option="{ option }">
            {{ option.name }}
          </template>
        </Select>
        <small v-if="slotProps.error" class="text-red-500 text-xs">{{
          slotProps.error.message
        }}</small>
      </FormField>
    </div>

    <div class="mt-2 flex items-center gap-2">
      <FormField
        v-slot="slotProps"
        :name="`${props.path}.${props.path === 'shippingAddress' ? 'defaultShipping' : 'defaultBilling'}`"
      >
        <Checkbox
          :model-value="slotProps.value"
          :input-id="`${props.path}-default-${props.path === 'shippingAddress' ? 'shipping' : 'billing'}`"
          binary
        />
        <label
          :for="`default-${props.path === 'shippingAddress' ? 'shipping' : 'billing'}`"
          class="text-xs"
        >
          Set as default
          {{ props.path === 'shippingAddress' ? 'shipping' : 'billing' }}
          address
        </label>
        <small v-if="slotProps.error" class="text-red-500 text-xs">{{
          slotProps.error.message
        }}</small>
      </FormField>
    </div>
  </div>
</template>
