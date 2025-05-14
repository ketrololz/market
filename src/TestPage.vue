<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  useAuthStore,
  type RegistrationData,
  type AddressFormData,
} from './stores/authStore';
import appLogger from './utils/logger';

const authStore = useAuthStore();

// --- Состояние для формы регистрации ---
const registerFirstName = ref('');
const registerLastName = ref('');
const registerEmail = ref('');
const registerPassword = ref('');
const registerDateOfBirth = ref('');

// Адрес доставки
const shippingStreetName = ref('');
const shippingStreetNumber = ref('');
const shippingCity = ref('');
const shippingPostalCode = ref('');
const shippingCountry = ref('DE');
const shippingIsDefault = ref(true); // По умолчанию адрес доставки - дефолтный
const shippingIsBillingDefault = ref(false); // Если адрес один, и его хотят сделать дефолтным биллинговым

// Адрес биллинга (если отличается)
const useShippingAsBilling = ref(true); // Чекбокс "Использовать адрес доставки как адрес биллинга"
const billingStreetName = ref('');
const billingStreetNumber = ref('');
const billingCity = ref('');
const billingPostalCode = ref('');
const billingCountry = ref('DE');
const billingIsDefault = ref(false); // Если адрес биллинга отдельный и его хотят сделать дефолтным

// --- Состояние для формы логина ---
const loginEmail = ref('');
const loginPassword = ref('');

// --- Вычисляемые свойства из стора ---
const isLoading = computed(() => authStore.isLoading);
const errorMessage = computed(() => authStore.authErrorMessage);
const loggedInUser = computed(() => authStore.userProfile);
const isLoggedIn = computed(() => authStore.isUserLoggedIn);

// {
//     "email": "test12345@gmail.com",
//     "password": "12345678aA!",
//     "firstName": "Тест",
//     "lastName": "Тестов",
//     "dateOfBirth": "2003-02-28T21:00:00.000Z",
//     "address": {
//         "street": "Пушкина 6",
//         "city": "Москва",
//         "postalCode": "12345",
//         "country": {
//             "name": "Russia",
//             "code": "RU"
//         }
//     }
// }

// --- Обработчики ---
async function handleRegister() {
  const shippingAddressPayload: AddressFormData = {
    firstName: registerFirstName.value,
    lastName: registerLastName.value,
    streetName: shippingStreetName.value,
    streetNumber: shippingStreetNumber.value,
    city: shippingCity.value,
    postalCode: shippingPostalCode.value,
    country: shippingCountry.value,
    isDefaultShipping: shippingIsDefault.value,
    isDefaultBilling: useShippingAsBilling.value
      ? shippingIsBillingDefault.value
      : false,
  };

  const registrationPayload: RegistrationData = {
    email: registerEmail.value,
    password: registerPassword.value,
    firstName: registerFirstName.value,
    lastName: registerLastName.value,
    dateOfBirth: registerDateOfBirth.value || undefined,
    shippingAddress: shippingAddressPayload,
    useShippingAsBilling: useShippingAsBilling.value,
  };

  if (!useShippingAsBilling.value) {
    registrationPayload.billingAddress = {
      firstName: registerFirstName.value,
      lastName: registerLastName.value,
      streetName: billingStreetName.value,
      streetNumber: billingStreetNumber.value,
      city: billingCity.value,
      postalCode: billingPostalCode.value,
      country: billingCountry.value,
      isDefaultBilling: billingIsDefault.value,
    };
  }

  const success = await authStore.register(registrationPayload);
  if (success) {
    appLogger.log(
      'Registration (and auto-login) process initiated successfully from component.',
    );
    registerFirstName.value = '';
    registerLastName.value = '';
    registerEmail.value = '';
    registerPassword.value = '';
    registerDateOfBirth.value = '';
    shippingStreetName.value = '';
    shippingStreetNumber.value = '';
    shippingCity.value = '';
    shippingPostalCode.value = '';
    shippingCountry.value = 'DE';
    shippingIsDefault.value = true;
    shippingIsBillingDefault.value = false;
    useShippingAsBilling.value = true;
    billingStreetName.value = '';
    billingStreetNumber.value = '';
    billingCity.value = '';
    billingPostalCode.value = '';
    billingCountry.value = 'DE';
    billingIsDefault.value = false;
  } else {
    appLogger.log('Registration failed, error should be displayed.');
  }
}

async function handleLogin() {
  const success = await authStore.login({
    email: loginEmail.value,
    password: loginPassword.value,
  });
  if (success) {
    appLogger.log('Login process initiated successfully from component.');
    loginEmail.value = '';
    loginPassword.value = '';
  } else if (authStore.authErrorDetails) {
    appLogger.log('Login failed with code:', authStore.authErrorDetails.code);
  }
}

async function handleLogout() {
  await authStore.logout();
  appLogger.log('Logout process initiated from component.');
}

onMounted(() => {
  authStore.restoreUserSession();
});
</script>

<template>
  <div class="container">
    <h1>Магазин Настолок (Адреса)</h1>
    <div v-if="isLoading" class="message info">Выполняется запрос...</div>
    <div v-if="errorMessage && !isLoggedIn" class="message error">
      {{ errorMessage }}
    </div>
    <hr />

    <div v-if="isLoggedIn && loggedInUser">
      <h2>
        Добро пожаловать, {{ loggedInUser.firstName || loggedInUser.email }}!
      </h2>
      <button class="form-button logout" @click="handleLogout">Выйти</button>
      <h3>Адреса в профиле (для проверки):</h3>
      <pre v-if="loggedInUser.addresses && loggedInUser.addresses.length">{{
        JSON.stringify(loggedInUser.addresses, null, 2)
      }}</pre>
      <p v-else>Адресов нет.</p>
      <p>
        Адрес доставки по умолч. ID:
        {{ loggedInUser.defaultShippingAddressId || 'Не задан' }}
      </p>
      <p>
        Адрес биллинга по умолч. ID:
        {{ loggedInUser.defaultBillingAddressId || 'Не задан' }}
      </p>
    </div>

    <div v-else class="forms-wrapper">
      <!-- Форма Логина -->
      <form @submit.prevent="handleLogin">
        <h2>Вход</h2>
        <div class="form-row">
          <label for="login-email">Email:</label>
          <input
            id="login-email"
            v-model="loginEmail"
            type="email"
            required
            class="form-input"
          />
        </div>
        <div class="form-row">
          <label for="login-password">Пароль:</label>
          <input
            id="login-password"
            v-model="loginPassword"
            type="password"
            required
            class="form-input"
          />
        </div>
        <button type="submit" :disabled="isLoading" class="form-button">
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </button>
      </form>

      <!-- Форма Регистрации -->
      <form @submit.prevent="handleRegister">
        <h2>Регистрация</h2>
        <fieldset>
          <legend>Личная информация</legend>
          <div class="form-row">
            <label for="reg-fname">Имя:</label>
            <input
              id="reg-fname"
              v-model="registerFirstName"
              type="text"
              required
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="reg-lname">Фамилия:</label>
            <input
              id="reg-lname"
              v-model="registerLastName"
              type="text"
              required
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="reg-dob">Дата рождения (ГГГГ-ММ-ДД):</label>
            <input
              id="reg-dob"
              v-model="registerDateOfBirth"
              type="date"
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="reg-email">Email:</label>
            <input
              id="reg-email"
              v-model="registerEmail"
              type="email"
              required
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="reg-password">Пароль:</label>
            <input
              id="reg-password"
              v-model="registerPassword"
              type="password"
              required
              class="form-input"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Адрес Доставки</legend>
          <div class="form-row">
            <label for="ship-street-name">Улица:</label>
            <input
              id="ship-street-name"
              v-model="shippingStreetName"
              type="text"
              required
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="ship-street-num">Дом/Кв:</label>
            <input
              id="ship-street-num"
              v-model="shippingStreetNumber"
              type="text"
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="ship-city">Город:</label>
            <input
              id="ship-city"
              v-model="shippingCity"
              type="text"
              required
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="ship-postal">Индекс:</label>
            <input
              id="ship-postal"
              v-model="shippingPostalCode"
              type="text"
              required
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="ship-country">Страна:</label>
            <select
              id="ship-country"
              v-model="shippingCountry"
              required
              class="form-input"
            >
              <option value="DE">Germany</option>
              <option value="US">United States</option>
              <option value="BY">Belarus</option>
              <option value="RU">Russia</option>
            </select>
          </div>
          <div class="form-row checkbox-row">
            <input
              id="ship-default"
              v-model="shippingIsDefault"
              type="checkbox"
            />
            <label for="ship-default" class="checkbox-label"
              >Сделать адресом доставки по умолчанию</label
            >
          </div>
          <div v-if="useShippingAsBilling" class="form-row checkbox-row">
            <!-- Показываем, только если адрес один -->
            <input
              id="ship-billing-default"
              v-model="shippingIsBillingDefault"
              type="checkbox"
            />
            <label for="ship-billing-default" class="checkbox-label"
              >Сделать адресом биллинга по умолчанию</label
            >
          </div>
        </fieldset>

        <div class="form-row checkbox-row">
          <input
            id="use-shipping-as-billing"
            v-model="useShippingAsBilling"
            type="checkbox"
          />
          <label for="use-shipping-as-billing" class="checkbox-label"
            >Использовать адрес доставки как адрес биллинга</label
          >
        </div>

        <fieldset v-if="!useShippingAsBilling">
          <legend>Адрес Биллинга (Платежный)</legend>
          <div class="form-row">
            <label for="bill-street-name">Улица:</label>
            <input
              id="bill-street-name"
              v-model="billingStreetName"
              type="text"
              required
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="bill-street-num">Дом/Кв:</label>
            <input
              id="bill-street-num"
              v-model="billingStreetNumber"
              type="text"
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="bill-city">Город:</label>
            <input
              id="bill-city"
              v-model="billingCity"
              type="text"
              required
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="bill-postal">Индекс:</label>
            <input
              id="bill-postal"
              v-model="billingPostalCode"
              type="text"
              required
              class="form-input"
            />
          </div>
          <div class="form-row">
            <label for="bill-country">Страна:</label>
            <select
              id="bill-country"
              v-model="billingCountry"
              required
              class="form-input"
            >
              <option value="DE">Germany</option>
              <option value="US">United States</option>
              <option value="BY">Belarus</option>
              <option value="RU">Russia</option>
            </select>
          </div>
          <div class="form-row checkbox-row">
            <input
              id="bill-default"
              v-model="billingIsDefault"
              type="checkbox"
            />
            <label for="bill-default" class="checkbox-label"
              >Сделать адресом биллинга по умолчанию</label
            >
          </div>
        </fieldset>

        <button
          type="submit"
          :disabled="isLoading"
          class="form-button register"
        >
          {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style>
body {
  font-family: sans-serif;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.forms-wrapper {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 450px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

form h2 {
  text-align: center;
  margin-top: 0;
}

.form-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 12px;
  text-align: left;
}

label {
  margin-bottom: 4px;
  font-weight: bold;
}

.form-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  box-sizing: border-box;
}

.form-button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s ease;
}
.form-button.register {
  background-color: #28a745;
}
.form-button.logout {
  background-color: #dc3545;
  margin-top: 0;
  margin-bottom: 15px;
}

.form-button:hover:not(:disabled) {
  opacity: 0.9;
}
.form-button.register:hover:not(:disabled) {
  background-color: #218838;
}
.form-button.logout:hover:not(:disabled) {
  background-color: #c82333;
}

.form-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

hr {
  margin: 30px 0;
  border: 0;
  border-top: 1px solid #eee;
}

.message {
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
}
.message.info {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #096dd9;
}
.message.error {
  background-color: #fff1f0;
  border: 1px solid #ffa39e;
  color: #cf1322;
}
.message.success {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
}

pre {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: left;
  max-height: 300px;
  overflow-y: auto;
}

fieldset {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
}
legend {
  font-weight: bold;
  padding: 0 5px;
}
.checkbox-row {
  flex-direction: row;
  align-items: center;
}
.checkbox-label {
  margin-bottom: 0;
  margin-left: 5px;
  font-weight: normal;
  min-width: auto;
}
.checkbox-row input[type='checkbox'] {
  width: auto;
}
</style>
