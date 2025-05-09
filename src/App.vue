<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiRoot } from './api/ctpClient';
import type {
  MyCustomerDraft,
  CustomerSignInResult,
  Customer,
} from '@commercetools/platform-sdk';
import {
  ClientBuilder,
  type PasswordAuthMiddlewareOptions,
  type RefreshAuthMiddlewareOptions,
} from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import {
  localStorageTokenCache,
  type ClearableTokenCache,
} from './api/localStorageTokenCache';
import {
  projectKey,
  clientId,
  clientSecret,
  apiUrl,
  authUrl,
  scopes,
} from './api/ctpClient';

const registerEmail = ref('');
const registerPassword = ref('');
const registerFirstName = ref('');
const registerLastName = ref('');
const loginEmail = ref('');
const loginPassword = ref('');

const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const loggedInUser = ref<Customer | null>(null);

const currentTokenState = ref(localStorageTokenCache.get());

async function handleRegister() {
  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  const myCustomerDraft: MyCustomerDraft = {
    email: registerEmail.value,
    password: registerPassword.value,
    firstName: registerFirstName.value,
    lastName: registerLastName.value,
  };

  try {
    const response = await apiRoot
      .me()
      .signup()
      .post({ body: myCustomerDraft })
      .execute();
    const signInResult = response.body as CustomerSignInResult;
    successMessage.value = `Успех! Пользователь ${signInResult.customer.email} зарегистрирован. Теперь можно войти.`;
    console.log('Попытка автологина после регистрации...');
    loginEmail.value = registerEmail.value;
    loginPassword.value = registerPassword.value;
    await handleLogin();

    registerEmail.value = '';
    registerPassword.value = '';
    registerFirstName.value = '';
    registerLastName.value = '';
  } catch (error: unknown) {
    console.error('Ошибка регистрации:', error);
    let message = 'Произошла неизвестная ошибка при регистрации.';

    if (isCtpSdkError(error)) {
      if (error.body?.message) {
        message = error.body.message;
        if (
          error.body.errors?.[0]?.code === 'DuplicateField' &&
          error.body.errors?.[0]?.field === 'email'
        ) {
          message = 'Этот email уже используется.';
        }
      } else if (error.message) {
        message = error.message;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    errorMessage.value = `Ошибка: ${message}`;
  } finally {
    isLoading.value = false;
  }
}

async function handleLogin() {
  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  console.log('Начало входа (с TokenCache)...');

  (localStorageTokenCache as ClearableTokenCache).clear();
  currentTokenState.value = localStorageTokenCache.get();

  try {
    const passwordAuthOptions: PasswordAuthMiddlewareOptions = {
      host: authUrl,
      projectKey: projectKey,
      credentials: {
        clientId,
        clientSecret,
        user: { username: loginEmail.value, password: loginPassword.value },
      },
      scopes: scopes,
      tokenCache: localStorageTokenCache,
      httpClient: fetch,
    };

    const loginClient = new ClientBuilder()
      .withPasswordFlow(passwordAuthOptions)
      .withHttpMiddleware({ host: apiUrl, httpClient: fetch })
      .build();

    const loginApiRoot = createApiBuilderFromCtpClient(
      loginClient,
    ).withProjectKey({ projectKey });

    const meResponse = await loginApiRoot.me().get().execute();

    loggedInUser.value = meResponse.body as Customer;
    currentTokenState.value = localStorageTokenCache.get();
    successMessage.value = `Вход выполнен успешно! Привет, ${loggedInUser.value.firstName || loggedInUser.value.email}! Токены сохранены в localStorage.`;
    loginEmail.value = '';
    loginPassword.value = '';
  } catch (error: unknown) {
    // Типизируем как unknown
    console.error('Ошибка входа:', error);
    (localStorageTokenCache as ClearableTokenCache).clear();
    currentTokenState.value = localStorageTokenCache.get();
    loggedInUser.value = null;

    let message = 'Произошла неизвестная ошибка при входе.';

    if (isCtpSdkError(error)) {
      const statusCode = error.statusCode || error.status;
      if (
        statusCode === 400 &&
        error.body?.message?.includes('invalid_grant')
      ) {
        message = 'Неверный email или пароль.';
      } else if (
        statusCode === 403 &&
        error.body?.code === 'insufficient_token_grant_type'
      ) {
        message = 'Ошибка прав доступа токена. Попробуйте выйти и войти снова.';
      } else if (error.body?.message) {
        message = error.body.message;
      } else if (error.message) {
        message = error.message;
      }
    } else if (error instanceof Error) {
      if (error.message.includes('Ошибка получения токенов')) {
        message = error.message;
        if (error.message.includes('invalid_grant')) {
          message = 'Неверный email или пароль.';
        }
      } else {
        message = error.message;
      }
    }

    errorMessage.value = `Ошибка: ${message}`;
  } finally {
    isLoading.value = false;
    console.log('Процесс входа завершен.');
  }
}

async function handleLogout() {
  console.log('Выход из системы...');
  const tokenToRevoke =
    currentTokenState.value.refreshToken || currentTokenState.value.token;

  loggedInUser.value = null;
  localStorageTokenCache.clear();
  currentTokenState.value = localStorageTokenCache.get();
  successMessage.value = 'Вы успешно вышли.';
  errorMessage.value = null;

  if (tokenToRevoke) {
    try {
      const revokeUrl = `${authUrl}/oauth/token/revoke`;
      const credentials = btoa(`${clientId}:${clientSecret}`);
      await fetch(revokeUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `token=${encodeURIComponent(tokenToRevoke)}`,
      });
      console.log('Token revocation attempted.');
    } catch (err) {
      console.error('Token revocation failed:', err);
    }
  }
}

async function checkAuthOnLoad() {
  const initialTokenState = localStorageTokenCache.get();
  console.log(
    'Проверка сессии при загрузке. Refresh token:',
    initialTokenState.refreshToken,
  );

  if (initialTokenState.refreshToken) {
    isLoading.value = true;
    errorMessage.value = null;
    successMessage.value = 'Проверка сохраненной сессии...';
    try {
      const refreshAuthOptions: RefreshAuthMiddlewareOptions = {
        host: authUrl,
        projectKey: projectKey,
        credentials: { clientId, clientSecret },
        refreshToken: initialTokenState.refreshToken,
        tokenCache: localStorageTokenCache,
        httpClient: fetch,
      };

      const refreshClient = new ClientBuilder()
        .withRefreshTokenFlow(refreshAuthOptions)
        .withHttpMiddleware({ host: apiUrl, httpClient: fetch })
        .build();

      const refreshApiRoot = createApiBuilderFromCtpClient(
        refreshClient,
      ).withProjectKey({ projectKey });

      const meResponse = await refreshApiRoot.me().get().execute();

      loggedInUser.value = meResponse.body as Customer;
      currentTokenState.value = localStorageTokenCache.get();
      successMessage.value = `Сессия восстановлена для ${loggedInUser.value.firstName || loggedInUser.value.email}.`;
      console.log('Сессия успешно восстановлена.');
    } catch (error: unknown) {
      console.error('Ошибка восстановления сессии:', error);
      handleLogout();
      errorMessage.value =
        'Не удалось восстановить сессию. Пожалуйста, войдите снова.';
      successMessage.value = null;
    } finally {
      isLoading.value = false;
    }
  } else {
    console.log('Нет сохраненного refresh token, пользователь не вошел.');
    if (loggedInUser.value) {
      handleLogout();
    }
  }
}

onMounted(() => {
  checkAuthOnLoad();
});

interface CtpErrorBodyError {
  code: string;
  message?: string;
  field?: string;
}

interface CtpErrorBody {
  statusCode?: number;
  message?: string;
  errors?: CtpErrorBodyError[];
  error?: string;
  error_description?: string;
  code?: string;
}

interface CtpSdkError extends Error {
  statusCode?: number;
  status?: number;
  body?: CtpErrorBody;
  code?: string;
  originalRequest?: unknown;
}

function isCtpSdkError(error: unknown): error is CtpSdkError {
  return (
    error instanceof Error &&
    (typeof (error as CtpSdkError).statusCode === 'number' ||
      typeof (error as CtpSdkError).status === 'number' ||
      typeof (error as CtpSdkError).body === 'object' ||
      typeof (error as CtpSdkError).code === 'string')
  );
}
</script>

<template>
  <div class="container">
    <h1>Магазин Настолок (Тест Логина/Регистрации)</h1>

    <!-- Область для сообщений и статуса -->
    <div v-if="isLoading" class="message info">Выполняется запрос...</div>
    <div v-if="errorMessage" class="message error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="message success">
      {{ successMessage }}
    </div>
    <hr />

    <div v-if="loggedInUser">
      <h2>
        Добро пожаловать, {{ loggedInUser.firstName || loggedInUser.email }}!
      </h2>
      <button class="form-button logout" @click="handleLogout">Выйти</button>
      <h3>Ваши данные:</h3>
      <pre>{{ JSON.stringify(loggedInUser, null, 2) }}</pre>
      <h3>Токены из кеша (для отладки):</h3>
      <p>
        Access Token:
        {{
          currentTokenState.token
            ? currentTokenState.token.substring(0, 10) + '...'
            : 'Нет'
        }}
      </p>
      <p>
        Refresh Token:
        {{
          currentTokenState.refreshToken
            ? currentTokenState.refreshToken.substring(0, 10) + '...'
            : 'Нет'
        }}
      </p>
      <p>
        Expiration Time:
        {{
          currentTokenState.expirationTime > 0
            ? new Date(currentTokenState.expirationTime).toLocaleString()
            : 'Нет'
        }}
      </p>
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
