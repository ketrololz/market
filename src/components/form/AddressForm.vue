<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, onMounted } from 'vue';
import { Form, type FormInstance, type FormSubmitEvent } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';

import AddressFields from '@/components/form/AddressFields.vue';
import { addressSchema } from '@/schemas/addressSchema';
import { useCountries } from '@/composables/useCountries';
import { useProjectSettingsStore } from '@/stores/projectSettingsStore';
import * as yup from 'yup';

const projectSettingsStore = useProjectSettingsStore();

const { countries } = useCountries();

onMounted(async () => {
  if (projectSettingsStore.getAvailableCountries.length === 0) {
    await projectSettingsStore.fetchProjectSettings();
  }
});

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
  path?: string;
  type?: 'shipping' | 'billing';
}>();

const emit = defineEmits<{
  (e: 'submit', data: AddressFormData): void;
}>();

const formRef = ref<FormInstance>();
const formPath = props.path ?? 'address';

const isValid = computed(() => {
  return formRef.value?.valid ?? false;
});

async function onFormSubmit({ values, valid }: FormSubmitEvent) {
  if (valid) {
    const formValues = props.path ? values[formPath] : values;
    emit('submit', formValues as AddressFormData);
  }
}

defineExpose({ submit: onFormSubmit, isValid });
</script>

<template>
  <Form
    ref="formRef"
    :initial-values="
      formPath === 'address'
        ? props.initialValues
        : { [formPath]: props.initialValues }
    "
    :resolver="
      yupResolver(
        formPath === 'address'
          ? addressSchema
          : yup.object({ [formPath]: addressSchema }),
      )
    "
    class="flex flex-col gap-2"
    @submit="onFormSubmit"
  >
    <AddressFields :path="formPath" :form="formRef" :countries="countries" />
  </Form>
</template>
