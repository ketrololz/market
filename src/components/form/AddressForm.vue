<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue';
import { Form, type FormInstance } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';

import AddressFields from '@/components/form/AddressFields.vue';
import { addressSchema } from '@/schemas/addressSchema';

export interface AddressFormData {
  streetName: string;
  city: string;
  postalCode: string;
  country: string;
  defaultShipping?: boolean;
  defaultBilling?: boolean;
}

const props = defineProps<{
  initialValues: AddressFormData;
  countries: { name: string; code: string }[];
  path?: string;
}>();

const emit = defineEmits<{
  (e: 'submit', data: AddressFormData): void;
}>();

const formRef = ref<FormInstance>();
const formData = ref<AddressFormData>({ ...props.initialValues });
console.log('AddressForm initial values:', formData.value);

const formPath = props.path ?? 'address';

const isValid = computed(() => {
  return formRef.value?.valid ?? false;
});

function submitForm() {
  if (formRef.value?.valid) {
    emit('submit', formData.value);
  }
}

defineExpose({ submit: submitForm, isValid });
</script>

<template>
  <Form
    ref="formRef"
    :model-value="formData"
    :resolver="yupResolver(addressSchema)"
    class="flex flex-col gap-2"
    @submit="submitForm"
  >
    <AddressFields
      :path="formPath"
      :form="formRef"
      :countries="props.countries"
    />
  </Form>
</template>
