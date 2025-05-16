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
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <FormField
        v-slot="slotProps"
        :name="`${props.path}.street`"
        class="w-1/2"
      >
        <BaseInput
          :input-id="`${props.path}-street`"
          :model-value="slotProps.value"
          :error-message="slotProps.error"
          :readonly="props.readonly"
          placeholder="Street"
        />
      </FormField>

      <FormField v-slot="slotProps" :name="`${props.path}.city`" class="w-1/2">
        <BaseInput
          :input-id="`${props.path}-city`"
          :model-value="slotProps.value"
          :error-message="slotProps.error"
          :readonly="props.readonly"
          placeholder="City"
        />
      </FormField>
    </div>

    <div class="flex gap-2">
      <FormField
        v-slot="slotProps"
        :name="`${props.path}.postalCode`"
        class="w-1/2"
      >
        <BaseInput
          :input-id="`${props.path}-postalCode`"
          :model-value="slotProps.value"
          :error-message="slotProps.error"
          :readonly="props.readonly"
          placeholder="Postal Code"
        />
      </FormField>

      <FormField
        v-slot="slotProps"
        :name="`${props.path}.country`"
        class="w-1/2"
      >
        <Select
          :model-value="slotProps.value"
          :options="props.countries"
          size="small"
          placeholder="Select a Country"
          class="w-full"
          :disabled="props.readonly"
          option-label="name"
          :input-id="`${props.path}-country`"
          @update:model-value="slotProps.setValue"
        >
          <template #value="{ value }">
            <span>{{ value?.name || 'Select a Country' }}</span>
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
        :name="`${props.path}.${props.path === 'address' ? 'defaultShipping' : 'defaultBilling'}`"
      >
        <Checkbox
          :model-value="slotProps.value"
          :input-id="`${props.path}-default-${props.path === 'address' ? 'shipping' : 'billing'}`"
          binary
          :disabled="props.readonly"
          @update:model-value="slotProps.setValue"
        />
        <label
          :for="`default-${props.path === 'address' ? 'shipping' : 'billing'}`"
          class="text-xs"
        >
          Set as default
          {{ props.path === 'address' ? 'shipping' : 'billing' }} address
        </label>
        <small v-if="slotProps.error" class="text-red-500 text-xs">{{
          slotProps.error.message
        }}</small>
      </FormField>
    </div>
  </div>
</template>
