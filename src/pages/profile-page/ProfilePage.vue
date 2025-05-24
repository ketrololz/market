<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AuthService from '@/services/auth/authService';
import type { Customer, Address } from '@commercetools/platform-sdk';

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

function isDefaultAddress(
  address: Address,
  type: 'shipping' | 'billing',
): boolean {
  if (!customer.value) return false;

  const defaultId =
    type === 'shipping'
      ? customer.value.defaultShippingAddressId
      : customer.value.defaultBillingAddressId;

  return defaultId === address.id;
}
</script>

<template>
  <div>
    <div v-if="isLoading">Загрузка...</div>
    <div v-else-if="customer">
      <h1>User Profile</h1>

      <!-- Personal Info Section -->
      <section>
        <h2>Личная информация</h2>
        <p><strong>Имя:</strong> {{ customer.firstName }}</p>
        <p><strong>Фамилия:</strong> {{ customer.lastName }}</p>
        <p><strong>Дата рождения:</strong> {{ customer.dateOfBirth }}</p>
      </section>

      <!-- Address Info Section -->
      <section>
        <h2>Сохранённые адреса</h2>
        <div
          v-for="address in customer.addresses"
          :key="address.id"
          class="address-card"
          :class="{
            'default-shipping': isDefaultAddress(address, 'shipping'),
            'default-billing': isDefaultAddress(address, 'billing'),
          }"
        >
          <p><strong>Улица:</strong> {{ address.streetName }}</p>
          <p><strong>Город:</strong> {{ address.city }}</p>
          <p><strong>Регион:</strong> {{ address.region }}</p>
          <p><strong>Индекс:</strong> {{ address.postalCode }}</p>
          <p><strong>Страна:</strong> {{ address.country }}</p>
          <p v-if="isDefaultAddress(address, 'shipping')" class="label">
            📦 Адрес доставки (по умолчанию)
          </p>
          <p v-if="isDefaultAddress(address, 'billing')" class="label">
            💳 Адрес оплаты (по умолчанию)
          </p>
        </div>
      </section>
    </div>

    <div v-else>
      <p>Не удалось загрузить данные пользователя.</p>
    </div>
  </div>
</template>

<style scoped>
.address-card {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}
.default-shipping {
  background-color: #e6f7ff;
}
.default-billing {
  background-color: #fffbe6;
}
.label {
  font-weight: bold;
  color: #1890ff;
  margin-top: 0.5rem;
}
</style>
