<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AuthService from '@/services/auth/authService';
import type { Customer, Address } from '@commercetools/platform-sdk';
import { Panel } from 'primevue';
import AddressSection from './AddressSection.vue';
import EditableDialog from '@/components/editable-dialog/EditableDialog.vue';
import { useDialogManager } from './../../composables/useDialogManager';
import UserInfoForm from '@/components/form/UserInfoForm.vue';
import PasswordForm from '@/components/form/PasswordForm.vue';
import type { PasswordFormData } from '@/components/form/PasswordForm.vue';
import type { UserInfoFormData } from '@/components/form/UserInfoForm.vue';
import { useAuthStore } from '@/stores/authStore';
import type { UserInfoFormRef } from '@/components/form/types/UserFormRef';

const {
  activeDialog,
  openDialog,
  closeDialog,
  isProfileDialogVisible,
  isPasswordDialogVisible,
} = useDialogManager();

const customer = ref<Customer | null>(null);
const isLoading = ref(true);
const formRef = ref<UserInfoFormRef>();

const authStore = useAuthStore();

const isDialogVisible = computed({
  get: () => isProfileDialogVisible.value || isPasswordDialogVisible.value,
  set: (value: boolean) => {
    if (!value) {
      closeDialog();
    }
  },
});

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

const dialogTitle = computed(() => {
  switch (activeDialog.value) {
    case 'profile':
      return 'Edit Personal Info';
    case 'address':
      return 'Edit Address';
    case 'password':
      return 'Change Password';
    default:
      return '';
  }
});

const currentInitialValues = computed<
  UserInfoFormData | PasswordFormData | null
>(() => {
  if (activeDialog.value === 'profile' && customer.value) {
    const { email, firstName, lastName, dateOfBirth } = customer.value;
    return {
      email: email ?? '',
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      dateOfBirth: dateOfBirth ?? '',
    };
  } else if (activeDialog.value === 'password') {
    return {
      currentPassword: '',
      newPassword: '',
    };
  }
  return null;
});

const currentFormComponent = computed(() => {
  if (activeDialog.value === 'profile') return UserInfoForm;
  if (activeDialog.value === 'password') return PasswordForm;
  return null;
});

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

function triggerSubmit() {
  formRef.value?.submit();
}

async function handleSave(data: UserInfoFormData | PasswordFormData) {
  if (activeDialog.value === 'profile') {
    const success = await authStore.updateProfile(data as UserInfoFormData);
    if (success) {
      customer.value = authStore.userProfile;
      closeDialog();
    }
  } else if (activeDialog.value === 'password') {
    const success = await authStore.updatePassword(data as PasswordFormData);
    if (success) {
      customer.value = authStore.userProfile;
      closeDialog();
    }
  }
}
</script>

<template>
  <div class="text-sm mx-2">
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="customer">
      <h1 class="text-center text-xl font-semibold mt-4">User Profile</h1>
      <Panel
        pt:root:class="p-2  bg-white rounded-lg shadow-md m-4 max-w-3xl mx-auto"
      >
        <template #header>
          <div class="flex justify-between items-center w-full">
            <span class="text-lg">Personal Information</span>
            <button
              class="text-xs text-blue-600 cursor-pointer text-blue-600 hover:underline"
              @click="openDialog('profile')"
            >
              Edit
            </button>
          </div>
        </template>
        <p class="flex gap-2">
          <strong class="w-48">Email:</strong>
          {{ customer.email }}
        </p>
        <p class="flex gap-2">
          <strong class="w-48">First Name:</strong>
          {{ customer.firstName }}
        </p>
        <p class="flex gap-2">
          <strong class="w-48">Last Name:</strong>
          {{ customer.lastName }}
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
              @click="openDialog('password')"
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

  <EditableDialog
    v-model="isDialogVisible"
    :title="dialogTitle"
    :edit="true"
    :initial-values="currentInitialValues"
    @submit="triggerSubmit"
  >
    <template #default="{ initialValues }">
      <component
        :is="currentFormComponent"
        ref="formRef"
        v-bind="
          activeDialog === 'profile'
            ? {
                initialValues: initialValues as UserInfoFormData,
                onSubmit: handleSave,
              }
            : {
                initialValues: initialValues as PasswordFormData,
                onSubmit: handleSave,
              }
        "
      />
    </template>
  </EditableDialog>
</template>
