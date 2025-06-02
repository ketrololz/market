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
import AddressForm from '@/components/form/AddressForm.vue';
import type { PasswordFormData } from '@/components/form/PasswordForm.vue';
import type { UserInfoFormData } from '@/components/form/UserInfoForm.vue';
import { useAuthStore } from '@/stores/authStore';
import type { UserInfoFormRef } from '@/components/form/types/UserFormRef';
import type { CustomerAddressData } from '@/services/auth/types/customerAddressData';

const {
  activeDialog,
  openDialog,
  closeDialog,
  isProfileDialogVisible,
  isPasswordDialogVisible,
  isAddressDialogVisible,
} = useDialogManager();

const customer = ref<Customer | null>(null);
const isLoading = ref(true);
const formRef = ref<UserInfoFormRef>();
const editedAddress = ref<Address | null>(null);
const addressType = ref<'shipping' | 'billing' | null>(null);

const authStore = useAuthStore();

const isDialogVisible = computed({
  get: () =>
    isProfileDialogVisible.value ||
    isPasswordDialogVisible.value ||
    isAddressDialogVisible.value,
  set: (value: boolean) => {
    if (!value) {
      closeDialog();
    }
  },
});

function isShippingDeleteDisabled() {
  return shippingAddresses.value.length <= 1;
}

function isBillingDeleteDisabled() {
  return billingAddresses.value.length <= 1;
}

async function loadCustomer() {
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
}

onMounted(async () => {
  await loadCustomer();
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

const initialValues = computed<
  UserInfoFormData | PasswordFormData | CustomerAddressData | null
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
  } else if (activeDialog.value === 'address' && customer.value) {
    if (editedAddress.value) {
      return {
        id: editedAddress.value.id,
        streetName: editedAddress.value.streetName ?? '',
        city: editedAddress.value.city ?? '',
        postalCode: editedAddress.value.postalCode ?? '',
        country: editedAddress.value.country ?? '',
        defaultShipping:
          addressType.value === 'shipping' &&
          customer.value.defaultShippingAddressId === editedAddress.value.id,
        defaultBilling:
          addressType.value === 'billing' &&
          customer.value.defaultBillingAddressId === editedAddress.value.id,
      };
    }
    return {
      streetName: '',
      city: '',
      postalCode: '',
      country: '',
      defaultShipping: addressType.value === 'shipping' ? false : undefined,
      defaultBilling: addressType.value === 'billing' ? false : undefined,
    };
  }
  return null;
});

const componentProps = computed(() => {
  if (activeDialog.value === 'profile') {
    return {
      initialValues: initialValues.value as UserInfoFormData,
      onSubmit: handleSave,
    };
  } else if (activeDialog.value === 'address') {
    return {
      initialValues: initialValues.value as CustomerAddressData,
      onSubmit: handleSave,
      type: addressType.value as 'shipping' | 'billing',
      path:
        addressType.value === 'shipping' ? 'shippingAddress' : 'billingAddress',
    };
  } else {
    return {
      initialValues: initialValues.value as PasswordFormData,
      onSubmit: handleSave,
    };
  }
});

const currentFormComponent = computed(() => {
  if (activeDialog.value === 'profile') return UserInfoForm;
  if (activeDialog.value === 'password') return PasswordForm;
  if (activeDialog.value === 'address') return AddressForm;
  return null;
});

const isEditMode = computed(() => {
  if (activeDialog.value === 'profile' || activeDialog.value === 'password') {
    return true;
  } else if (activeDialog.value === 'address') {
    return editedAddress.value !== null;
  }
  return false;
});

async function onDeleteAddress(address: Address) {
  if (!address.id) {
    console.warn('Address id is undefined, cannot delete.');
    return;
  }
  try {
    await authStore.removeAddress(address.id);
    customer.value = authStore.userProfile;
  } catch (error) {
    console.error('Failed to delete address:', error);
  }
}

async function onSetDefault(address: Address, type: 'shipping' | 'billing') {
  if (!address.id) {
    console.warn('Address id is undefined, cannot set as default.');
    return;
  }
  try {
    await authStore.setDefaultAddress(address.id, type);

    customer.value = authStore.userProfile;
  } catch (error) {
    console.error(`Failed to set default ${type} address:`, error);
  }
}

function onEditAddress(address: Address | null, type: 'shipping' | 'billing') {
  editedAddress.value = address;
  addressType.value = type;
  openDialog('address', !!address);
}

function triggerSubmit() {
  formRef.value?.submit();
}

async function handleSave(
  data: UserInfoFormData | PasswordFormData | CustomerAddressData,
) {
  let success = false;

  if (activeDialog.value === 'profile') {
    success = await authStore.updateProfile(data as UserInfoFormData);
  } else if (activeDialog.value === 'password') {
    success = await authStore.updatePassword(data as PasswordFormData);
  } else if (activeDialog.value === 'address') {
    const addressData = {
      ...(data as CustomerAddressData),
      id: editedAddress.value?.id,
    };
    success = await authStore.updateAddress(addressData);
  }

  if (success) {
    await loadCustomer();
    closeDialog();
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
            :is-delete-disabled="isShippingDeleteDisabled"
            @edit-or-add="onEditAddress"
            @delete="onDeleteAddress"
            @set-default="onSetDefault"
          />

          <AddressSection
            title="Billing Addresses"
            :addresses="billingAddresses"
            type="billing"
            :default-billing-address-id="customer.defaultBillingAddressId"
            :is-delete-disabled="isBillingDeleteDisabled"
            @edit-or-add="onEditAddress"
            @delete="onDeleteAddress"
            @set-default="onSetDefault"
          />
        </div>
      </Panel>
    </div>
  </div>

  <EditableDialog
    v-model="isDialogVisible"
    :title="dialogTitle"
    :edit="isEditMode"
    :initial-values="initialValues"
    @submit="triggerSubmit"
  >
    <template #default="{}">
      <component
        :is="currentFormComponent"
        ref="formRef"
        v-bind="componentProps"
      />
    </template>
  </EditableDialog>
</template>
