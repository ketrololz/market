<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore();

const registerEmail = ref('');
const registerPassword = ref('');
const registerFirstName = ref('');
const registerLastName = ref('');
const loginEmail = ref('');
const loginPassword = ref('');

const isLoading = computed(() => authStore.isLoadingStatus);
const errorMessage = computed(() => authStore.getAuthError);
const loggedInUser = computed(() => authStore.getCurrentUser);
const isLoggedIn = computed(() => authStore.getIsLoggedIn);

async function handleRegister() {
  const success = await authStore.register({
    email: registerEmail.value,
    password: registerPassword.value,
    firstName: registerFirstName.value,
    lastName: registerLastName.value,
  });
  if (success) {
    console.log(
      'Registration (and auto-login) process initiated successfully from component.',
    );
  } else {
    console.log('Registration failed, error should be displayed.');
  }
}

async function handleLogin() {
  const success = await authStore.login({
    email: loginEmail.value,
    password: loginPassword.value,
  });
  if (success) {
    console.log('Login process initiated successfully from component.');
    loginEmail.value = '';
    loginPassword.value = '';
  } else {
    console.log('Login failed, error should be displayed.');
  }
}

async function handleLogout() {
  await authStore.logout();
  console.log('Logout process initiated from component.');
}

onMounted(() => {
  authStore.checkAuth();
});
</script>

<template>
  <div class="container">
    <h1>Магазин Настолок (Store + Service)</h1>
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
    </div>

    <div v-else class="forms-wrapper">
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

      <form @submit.prevent="handleRegister">
        <h2>Регистрация</h2>
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
  max-width: 800px;
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
  width: 300px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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
</style>
