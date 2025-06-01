<script setup lang="ts">
import { FormField, type FormInstance } from '@primevue/forms';
import BaseInput from './BaseTextInput.vue';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';

const props = defineProps<{
  path: string;
  countries: { name: string; code: string }[];
  readonly?: boolean;
  form: FormInstance | undefined;
}>();

const getCountryNameByCode = (code: string | undefined | null) => {
  if (!code) return undefined;
  const country = props.countries.find((c) => c.code === code);
  return country?.name;
};

function forceRevalidatePostalCode() {
  const path = `${props.path}.postalCode`;
  const currentValue = props.form?.getFieldState(path)?.value;

  props.form?.setFieldValue(path, '');
  setTimeout(() => {
    props.form?.setFieldValue(path, currentValue);
  }, 0);
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <FormField
        v-slot="slotProps"
        :name="`${props.path}.streetName`"
        class="w-1/2 max-w-[178px]"
      >
        <label :for="`${props.path}-streetName`" class="text-xs">Street</label>
        <BaseInput
          :input-id="`${props.path}-streetName`"
          :model-value="slotProps.value"
          :error-message="slotProps.error"
          :readonly="props.readonly"
        />
      </FormField>

      <FormField
        v-slot="slotProps"
        :name="`${props.path}.city`"
        class="w-1/2 max-w-[178px]"
      >
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
        :validate-on-value-update="true"
        class="w-1/2 max-w-[178px]"
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
        class="w-1/2 max-w-[178px]"
      >
        <label :for="`${props.path}-country`" class="text-xs">Country</label>
        <Select
          :model-value="slotProps.value"
          :options="props.countries"
          size="small"
          placeholder="Select a Country"
          class="w-full text-left"
          :disabled="props.readonly"
          option-label="name"
          option-value="code"
          :input-id="`${props.path}-country`"
          @update:model-value="forceRevalidatePostalCode"
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
        <Message
          v-if="slotProps.error"
          severity="error"
          variant="simple"
          class="text-left"
          >{{
            typeof slotProps.error === 'string'
              ? slotProps.error
              : slotProps.error?.message
          }}</Message
        >
      </FormField>
    </div>

    <FormField
      v-slot="slotProps"
      :name="`${props.path}.${props.path === 'shippingAddress' ? 'defaultShipping' : 'defaultBilling'}`"
      class="mt-2 flex items-center gap-2"
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
    </FormField>
  </div>
</template>
